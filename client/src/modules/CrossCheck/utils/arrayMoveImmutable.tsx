import { CriteriaData } from 'services/course';

export function arrayMoveMutable(array: CriteriaData[], fromIndex: number, toIndex: number) {
  const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;

  if (startIndex >= 0 && startIndex < array.length) {
    const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;

    const [item] = array.splice(fromIndex, 1);
    array.splice(endIndex, 0, item);
  }
}

export function arrayMoveImmutable(array: CriteriaData[], fromIndex: number, toIndex: number) {
  const arrayCopy = [...array];
  arrayMoveMutable(arrayCopy, fromIndex, toIndex);
  return arrayCopy;
}
