import { isArray, isString } from 'shared'

type Style = string | Record<string, string | string[]> | null

/**
 * 为 style 属性进行打补丁
 */
export function patchStyle(el: Element, prev: Style, next: Style) {
  // 获取 style 对象
  const style = (el as HTMLElement).style

  // 判断新的样式是否为纯字符串
  const isCssString = isString(next)

  if (next && !isCssString) {
    // 赋值新的样式
    for (const key in next) {
      setStyle(style, key, next[key])
    }

    // 清理旧的样式
    if (prev && !isString(prev)) {
      for (const key in prev) {
        if (next[key] == null) {
          setStyle(style, key, '')
        }
      }
    }
  }
}

/**
 * 赋值样式
 */
function setStyle(
  style: CSSStyleDeclaration,
  name: string,
  val: string | string[],
) {
  if (isArray(val)) {
    val.forEach((v) => setStyle(style, name, v))
  } else {
    if (val == null) val = ''

    // CSSStyleDeclaration.setProperty() 方法接口为一个声明了 CSS 样式的对象设置一个新的值。MDN: https://developer.mozilla.org/zh-CN/docs/Web/API/CSSStyleDeclaration/setProperty
    style.setProperty(name, val)
  }
}
