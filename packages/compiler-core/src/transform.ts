import { isArray } from 'shared'
import { NodeTypes } from './ast'

export interface TransformContext {
  /**
   * AST 根节点
   */
  root: any
  /**
   * 每次转化时记录的父节点
   */
  parent: ParentNode | null
  /**
   * 每次转化时记录的子节点索引
   */
  childIndex: number
  /**
   * 当前处理的节点
   */
  currentNode: any
  /**
   * 协助创建 JavaScript AST 属性 helpers，该属性是一个数组，值为 Symbol(方法名)，表示 render 函数中创建 节点 的方法
   */
  helpers: Map<symbol, number>
  helper<T extends symbol>(name: T): T
  /**
   * 转化方法集合
   */
  nodeTransforms: any[]
  /**
   * 替换节点
   */
  replaceNode(node: any): void
}

/**
 * @description: 根据 AST 生成 JavaScript AST
 * @param {*} root
 * @param {*} options
 * @return {*}
 */
export function transform(root: any, options: any) {
  // 创建 transform 上下文
  const context = createTransformContext(root, options)
  // 按照深度优先依次处理 node 节点转化
  traverseNode(root, context)
}

/**
 * @description: 创建 transform 上下文
 */
export function createTransformContext(
  root: any,
  { nodeTransforms = [] },
): TransformContext {
  const context: TransformContext = {
    // options
    nodeTransforms,

    // state
    root,
    helpers: new Map(),
    currentNode: root,
    parent: null,
    childIndex: 0,

    // methods
    helper(name) {
      const count = context.helpers.get(name) || 0
      context.helpers.set(name, count + 1)
      return name
    },
    replaceNode(node) {
      context.parent!.children[context.childIndex] = context.currentNode = node
    },
  }

  return context
}

/**
 * @description: 按照深度优先依次处理 node 节点转化
 * @param {any} node
 * @param {TransformContext} context
 */
export function traverseNode(node: any, context: TransformContext) {
  // 步骤一：进入阶段， 存储所有节点的转化函数到 exitFns 中

  // 通过上下文记录当前正在处理的 node 节点
  context.currentNode = node
  // 获取当前所有 node 节点的 transform 方法
  const { nodeTransforms } = context

  // 存储转化函数的数组
  const exitFns: Array<() => void> = []

  // 遍历所有 node 节点的 transform 方法，缓存到 exitFns 中
  for (let i = 0; i < nodeTransforms.length; i++) {
    const onExit = nodeTransforms[i](node, context)
    if (onExit) {
      // 若指令的 transform 方法返回为数组，则需要结构
      if (isArray(onExit)) {
        exitFns.push(...onExit)
      } else {
        exitFns.push(onExit)
      }
    }
  }

  // 由于触发了 replaceNode 方法，所以需要将当前 node 节点替换为新的节点
  if (!context.currentNode) {
    return // 节点已删除
  } else {
    node = context.currentNode // 节点已更换
  }

  // 继续转换子节点(深度优先)
  switch (node.type) {
    case NodeTypes.IF_BRANCH:
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      traverseChildren(node, context)
      break
    case NodeTypes.INTERPOLATION: // 处理插值表达式 {{}}
      // context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.IF: // v-if 指令处理
      for (let i = 0; i < node.branches.length; i++) {
        traverseNode(node.branches[i], context)
      }
      break
    default:
      break
  }

  // 步骤二: 退出阶段，逆序执行 exitFns 中的转化函数
  context.currentNode = node
  let len = exitFns.length
  while (len--) {
    exitFns[len]()
  }
}

/**
 * @description: 循环处理子节点
 * @param {any} node
 * @param {TransformContext} context
 */
export function traverseChildren(node: any, context: TransformContext) {
  const children = node.children
  for (let i = 0; i < children.length; i++) {
    context.parent = node
    context.childIndex = i
    traverseNode(children[i], context)
  }
}
