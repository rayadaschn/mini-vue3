/**
 * @description: 判断是否为数组
 * @return {boolean}
 */
export const isArray = Array.isArray

/**
 * @description: 判断是否为数组
 * @return {boolean}
 */
export const isObject = (val: unknown): boolean => {
  return val !== null && typeof val === 'object'
}

/**
 * @description: 判断是否为函数
 * @return {boolean}
 */
export const isFunction = (val: unknown): boolean => {
  return Object.prototype.toString.call(val) === '[object Function]'
}
