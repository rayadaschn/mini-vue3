import { isArray, isObject } from 'shared'
import { VNode, createVNode, isVNode } from './vnode'

/**
 * @description: h 函数
 * @param {any} type
 * @param {any} propsOrChildren
 * @param {any} children
 */
export function h(
  type: any,
  propsOrChildren?: Record<string, any>,
  children?: VNode[],
): VNode {
  const l = arguments.length // 用户传递的参数数量
  // 如果用户只传递了两个参数，那么证明第二个参数可能是 props , 也可能是 children
  if (l === 2) {
    // 若第二个参数是对象，但不是数组。则第二个参数只有两种可能性：1. VNode 2.普通的 props
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // 1. 是 VNode, 则第二个参数是 children
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren])
      }

      // 2. 为普通的 props, 直接创建
      return createVNode(type, propsOrChildren)
    }
    // 如果第二个参数不是单纯的 object，则 第二个参数代表了 props
    else {
      return createVNode(type, null, propsOrChildren)
    }
  } else {
    // 若用户传递了三个或以上的参数，那么证明第二个参数一定代表了 props
    if (l > 3) {
      // eslint-disable-next-line prefer-rest-params
      children = Array.prototype.slice.call(arguments, 2)
    }
    // 如果传递的参数只有三个，则 children 是单纯的 children
    else if (l === 3 && isVNode(children)) {
      children = [children]
    }
    // 触发 createVNode 方法，创建 VNode 实例
    return createVNode(type, propsOrChildren, children)
  }
}
