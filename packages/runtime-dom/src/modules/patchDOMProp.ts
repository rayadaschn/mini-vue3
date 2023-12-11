/**
 * @description: 通过 DOM Properties 指定属性，此方法效率更高
 * @param {any} el
 * @param {string} key
 * @param {any} value
 */
export function patchDOMProp(el: any, key: string, value: any) {
  try {
    el[key] = value
  } catch (e: any) {
    console.error('DOM Properties 设置失败:', e)
  }
}
