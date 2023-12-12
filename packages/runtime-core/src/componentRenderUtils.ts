import { ShapeFlags } from 'shared'
import { Instance } from './component'
import { createVNode, Text, VNode } from './vnode'

/**
 * @description: 标准化 VNode
 * @param {VNode} child
 * @return {VNode} VNode
 */
export function normalizeVNode(child: VNode): VNode {
  if (typeof child === 'object') {
    return cloneIfMounted(child)
  } else {
    return createVNode(Text, null, String(child))
  }
}

/**
 * @description: clone VNode
 * @param {VNode} child
 * @return {VNode} VNode
 */
export function cloneIfMounted(child: VNode): VNode {
  return child
}

export function renderComponentRoot(instance: Instance) {
  const { vnode, render, data = {} } = instance

  let result
  try {
    // 解析到状态组件
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      // 获取到 result 返回值，如果 render 中使用了 this，则需要修改 this 指向
      result = normalizeVNode(render!.call(data))
    }
  } catch (err) {
    console.error(err)
  }

  return result
}
