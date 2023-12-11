/**
 * @description: 通过 setAttribute 设置 HTML Attributes 属性
 * @param {Element} el
 * @param {string} key
 * @param {any} value
 */
export function patchAttr(el: Element, key: string, value: any) {
  if (value == null) {
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, value)
  }
}
