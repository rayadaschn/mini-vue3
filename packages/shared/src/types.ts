/**
 * @description: 判断是否为数组
 * @return {boolean}
 */
export const isArray = Array.isArray

/**
 * @description: 判断是否为数组
 * @return {boolean}
 */
export const isObject = (val: unknown) => {
  return val !== null && typeof val === 'object'
}
