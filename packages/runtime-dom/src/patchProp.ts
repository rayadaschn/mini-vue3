import { isOn } from 'shared'
import { patchClass } from './modules'

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
    // style
  } else if (isOn(key)) {
    // 事件
  } else {
    // 其他属性
  }
  console.log('preValue', preValue)
}
