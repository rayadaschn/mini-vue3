/**
 * @description: 比较对象是否发生改变
 * @return {boolean}
 */
export const hasChanged = (val: any, oldVal: any): boolean => {
  return !Object.is(val, oldVal)
}
