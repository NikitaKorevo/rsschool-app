import { Button, Checkbox, Col, Form, Row, Table, Tag, Modal } from 'antd';
import withSession from 'components/withSession';
import { GithubAvatar } from 'components/GithubAvatar';
import { ModalForm } from 'components/Forms';
import { boolIconRenderer, PersonCell, getColumnSearchProps } from 'components/Table';
import { UserSearch } from 'components/UserSearch';
import withCourseData from 'components/withCourseData';
import { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseUser } from 'services/course';
import { CoursePageProps, UserGroup } from 'services/models';
import { UserService } from 'services/user';
import { UserGroupApi, UserGroupDto } from 'api';
import { AdminPageLayout } from 'components/PageLayout';

type Props = CoursePageProps;

const userGroupService = new UserGroupApi();

const rolesColors: Record<string, string> = {
  supervisor: 'purple',
  manager: 'volcano',
};

function Page(props: Props) {
  const courseId = props.course.id;

  const userService = new UserService();
  const [loading, setLoading] = useState(false);
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [courseUsers, setCourseUsers] = useState([] as CourseUser[]);
  const [userGroups, setUserGroups] = useState<UserGroupDto[] | null>(null);
  const [userModalData, setUserModalData] = useState(null as Partial<CourseUser> | null);
  const [groupModalData, setGroupModalData] = useState(null as UserGroupDto[] | null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [users, { data: groups }] = await Promise.all([
      courseService.getUsers(),
      props.session.isAdmin ? userGroupService.getUserGroups() : Promise.resolve({ data: null }),
    ]);
    setLoading(false);
    setCourseUsers(users);
    setUserGroups(groups);
  }, [courseId]);

  useAsync(loadData, [courseId]);

  const handleAddUser = () => {
    setUserModalData({});
  };

  const handleAddGroup = () => {
    setGroupModalData(userGroups);
  };

  const handleEditItem = (record: CourseUser) => {
    setUserModalData(record);
  };

  const loadUsers = async (searchText: string) => userService.searchUser(searchText);

  const handleUserModalSubmit = async (values: any) => {
    const record = createRecord(values);
    await courseService.upsertUser(record.githubId, record);

    setUserModalData(null);
    loadData();
  };

  const handleGroupModalSubmit = async (values: UserGroupDto[]) => {
    const records = createRecords(values);
    await courseService.upsertUsers(records);

    setGroupModalData(null);
    loadData();
  };

  const renderUserModal = (modalData: Partial<CourseUser>) => {
    return (
      <ModalForm
        getInitialValues={getInitialValues}
        data={modalData}
        title="Course User"
        submit={handleUserModalSubmit}
        cancel={() => setUserModalData(null)}
      >
        <Form.Item name="githubId" label="User" rules={[{ required: true, message: 'Please select an user' }]}>
          <UserSearch keyField="githubId" searchFn={loadUsers} />
        </Form.Item>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="isManager" valuePropName="checked">
              <Checkbox>Manager</Checkbox>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="isSupervisor" valuePropName="checked">
              <Checkbox>Supervisor</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </ModalForm>
    );
  };

  const renderGroupModal = (modalData: UserGroupDto[]) => {
    const [selectedGroups, setSelectedGroups] = useState<UserGroup[] | null>(null);
    return (
      groupModalData && (
        <Modal
          width={800}
          style={{ top: 20 }}
          open={true}
          onCancel={() => setGroupModalData(null)}
          onOk={() => handleGroupModalSubmit(selectedGroups!)}
          okButtonProps={{ disabled: !selectedGroups }}
        >
          <Table
            rowSelection={{
              onChange: (_: React.Key[], selectedRows: any[]) => {
                setSelectedGroups(selectedRows);
              },
              type: 'checkbox',
            }}
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
              },
              {
                title: 'Users',
                dataIndex: 'users',
                render: (_: any, record: UserGroupDto) => (
                  <>
                    {record.users.map(user => (
                      <Tag key={user.id} style={{ padding: 3, margin: 3 }}>
                        <GithubAvatar size={24} githubId={user.githubId} />
                        &nbsp;{user.name} ({user.githubId})
                      </Tag>
                    ))}
                  </>
                ),
              },
              {
                title: 'Roles',
                dataIndex: 'roles',
                render: (_: any, record: UserGroupDto) => (
                  <>
                    {record.roles.map(role => (
                      <Tag key={role} style={{ padding: 3, margin: 3 }} color={rolesColors[role]}>
                        {role}
                      </Tag>
                    ))}
                  </>
                ),
              },
            ]}
            dataSource={modalData}
            rowKey="id"
            pagination={false}
          />
        </Modal>
      )
    );
  };

  return (
    <AdminPageLayout session={props.session} loading={loading} courses={[props.course]}>
      {props.session.isAdmin && (
        <Button type="primary" onClick={handleAddGroup}>
          Add Group
        </Button>
      )}
      <Button type="link" onClick={handleAddUser}>
        Add User
      </Button>
      <Table
        rowKey="id"
        pagination={{ pageSize: 100 }}
        size="small"
        dataSource={courseUsers}
        columns={getColumns(handleEditItem)}
      />
      {renderUserModal(userModalData!)}
      {renderGroupModal(groupModalData!)}
    </AdminPageLayout>
  );
}

function getColumns(handleEditItem: any) {
  return [
    { title: 'User Id', dataIndex: 'id' },
    {
      title: 'User',
      dataIndex: 'name',
      render: (_: any, record: any) => <PersonCell value={record} />,
      ...getColumnSearchProps(['githubId', 'name']),
    },

    {
      title: 'Manager',
      dataIndex: 'isManager',
      render: boolIconRenderer,
    },
    {
      title: 'Supervisor',
      dataIndex: 'isSupervisor',
      render: boolIconRenderer,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_: any, record: CourseUser) => (
        <>
          <a onClick={() => handleEditItem(record)}>Edit</a>{' '}
        </>
      ),
    },
  ];
}

function createRecord(values: any) {
  const data = {
    githubId: values.githubId,
    isManager: values.isManager,
    isSupervisor: values.isSupervisor,
  };
  return data;
}

function createRecords(groups: UserGroupDto[]) {
  const data = groups.reduce((users, group) => {
    group.users.forEach(({ id }) => {
      users[id] = users[id] ?? {};
      users[id].isManager = users[id].isManager || group.roles.includes('manager');
      users[id].isSupervisor = users[id].isSupervisor || group.roles.includes('supervisor');
    });
    return users;
  }, {} as Record<string, { isManager: boolean; isSupervisor: boolean }>);
  return Object.entries(data).map(([id, roles]) => ({ ...roles, userId: Number(id) }));
}

function getInitialValues(modalData: Partial<CourseUser> | UserGroup[]) {
  return modalData;
}

export default withCourseData(withSession(Page));
