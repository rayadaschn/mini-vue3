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
