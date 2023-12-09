/**
 * @description: 判断是否为数组
 * @return {boolean}
 */
export const isArray = Array.isArray

/**
 * @description: 判断是否为数组
 * @return {boolean}
 */
export const isObject = (val: unknown): val is object => {
  return val !== null && typeof val === 'object'
}

/**
 * @description: 判断是否为函数
 * @return {boolean}
 */
export const isFunction = (val: unknown): boolean => {
  return Object.prototype.toString.call(val) === '[object Function]'
}

/**
 * @description: 判断是否为字符串
 * @param {unknown} val
 */
export const isString = (val: unknown): val is string => {
  return typeof val === 'string'
}

/**
 * @description: 比较对象是否发生改变
 */
export const hasChanged = (val: any, oldVal: any): boolean => {
  return !Object.is(val, oldVal)
}

/**
 * @description: 判断字符串是否以 on 开头
 * @param {string} val
 */
export const isOn = (val: string): boolean => {
  const onReg = /^on[a-z]/
  return onReg.test(val)
}
