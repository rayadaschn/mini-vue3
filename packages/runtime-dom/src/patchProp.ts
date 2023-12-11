import { isOn } from 'shared'
import {
  patchAttr,
  patchClass,
  patchDOMProp,
  patchEvent,
  patchStyle,
} from './modules'

/**
 * @description: 对 prop 进行打补丁更新
 */
export const patchProp = (
  el: Element,
  key: string,
  preValue: any,
  nextValue: any,
) => {
  if (key === 'class') {
    patchClass(el, nextValue) // 对 class 进行打补丁
  } else if (key === 'style') {
    patchStyle(el, preValue, nextValue) // 对 style 进行打补丁
  } else if (isOn(key)) {
    // 对 event 事件 prop 进行打补丁
    patchEvent(el, key, preValue, nextValue)
  }
  // 设置其它 properties 属性: 区分 HTML Attributes 和 DOM Properties
  else if (shouldSetAsProp(el, key)) {
    // 1. DOM Properties 进行设置速度更快，优先使用
    patchDOMProp(el, key, nextValue)
  } else {
    // 2. 剩余其他属性，统一用 HTML Attributes 的 setAttribute 进行设置，缺点是速度更慢
    patchAttr(el, key, nextValue)
  }
}

/**
 * @description: 检测该元素的目标属性是否可以通过 DOM Properties 进行设定，此方法效率更高
 * @param {Element} el
 * @param {string} key
 * @return {boolean}
 */
function shouldSetAsProp(el: Element, key: string) {
  // 处理各种边界条件

  // #1787, #2840 表单元素的表单属性是只读的，必须设置为属性 attribute
  if (key === 'form') {
    return false
  }

  // #1526 <input list> 必须设置为属性 attribute，因为 list 和 input 的属性必须通过 attribute 进行设定
  if (key === 'list' && el.tagName === 'INPUT') {
    return false
  }

  // #2766 <textarea type> 必须设置为属性 attribute，同理需要通过 attribute 进行设定
  if (key === 'type' && el.tagName === 'TEXTAREA') {
    return false
  }

  return key in el
}
