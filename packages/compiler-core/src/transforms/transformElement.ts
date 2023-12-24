import { NodeTypes, createVNodeCall } from '../ast'

/**
 * @description: 对 element 节点的转化方法
 * @param {*} node
 * @param {*} context
 */
export const transformElement = (node: any, context: any) => {
  return function postTransformElement() {
    node = context.currentNode

    // 仅处理 ELEMENT 类型
    if (node.type !== NodeTypes.ELEMENT) {
      return
    }

    const { tag } = node

    const vnodeTag = `"${tag}"`
    const vnodeProps: never[] = []
    const vnodeChildren = node.children

    node.codegenNode = createVNodeCall(
      context,
      vnodeTag,
      vnodeProps,
      vnodeChildren,
    )
  }
}
