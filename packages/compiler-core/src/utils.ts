import { NodeTypes } from './ast'

export function isText(node: { type: NodeTypes }) {
  return node.type === NodeTypes.INTERPOLATION || node.type === NodeTypes.TEXT
}
