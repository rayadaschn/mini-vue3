/**
 * @description: 收集依赖
 * @param {object} target
 * @param {unknown} key
 * @return {*}
 */
export function track(target: object, key: unknown) {
  console.log('收集依赖', target, key)
}

/**
 * @description: 触发依赖
 * @param {object} target
 * @param {unknown} key
 * @param {unknown} newValue
 * @return {*}
 */
export function trigger(target: object, key: unknown, newValue: unknown) {
  console.log('触发依赖', target, key, newValue)
}
