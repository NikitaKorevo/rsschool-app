import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DefaultGuard } from 'src/auth';
import { CoursesService } from 'src/courses/courses.service';
import { CurrentRequest } from '../auth/auth.service';
import { ProfileInfoDto, ProfileCourseDto, UpdateUserDto, UpdateProfileInfoDto } from './dto';
import { ProfileDto } from './dto/profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@ApiTags('profile')
@UseGuards(DefaultGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService, private readonly coursesService: CoursesService) {}

  @Get(':username/courses')
  @ApiOperation({ operationId: 'getUserCourses' })
  @ApiOkResponse({ type: [ProfileCourseDto] })
  public async getCourses(
    @Req() req: CurrentRequest,
    @Param('username') username: string,
  ): Promise<ProfileCourseDto[]> {
    const user = req.user;
    if (user.isAdmin) {
      const data = await this.coursesService.getAll();
      return data.map(course => new ProfileCourseDto(course));
    }
    if (username !== user.githubId && username !== 'me') {
      throw new ForbiddenException();
    }
    const data = await this.profileService.getCourses(user);
    return data.map(course => new ProfileCourseDto(course));
  }

  @Post('/user')
  @ApiOperation({ operationId: 'updateUser' })
  @ApiBody({ type: UpdateUserDto })
  public async updateUser(@Req() req: CurrentRequest, @Body() dto: UpdateUserDto) {
    const { user } = req;

    await this.profileService.updateUser(user.id, dto);
  }

  @Post('/info')
  @ApiOperation({ operationId: 'updateProfileInfo' })
  @ApiBody({ type: ProfileInfoDto })
  public async updateProfileInfo(@Req() req: CurrentRequest, @Body() dto: ProfileInfoDto) {
    const {
      user: { id },
    } = req;

    await this.profileService.updateProfile(id, dto);
  }

  @Patch('/info')
  @ApiOperation({ operationId: 'updateProfileInfoFlat' })
  @ApiBody({ type: UpdateProfileInfoDto })
  public async updateProfileFlatInfo(@Req() req: CurrentRequest, @Body() dto: UpdateProfileInfoDto) {
    const { user } = req;

    await this.profileService.updateProfileFlat(user.id, dto);
  }

  @Get(':username')
  @ApiOperation({ operationId: 'getProfile' })
  @ApiResponse({ type: ProfileDto })
  public async getProfileInfo(@Param('username') githubId: string) {
    const profile = await this.profileService.getProfile(githubId);

    return new ProfileDto(profile);
  }
}
