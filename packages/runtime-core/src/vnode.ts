import { ShapeFlags, isArray, isFunction, isObject, isString } from 'shared'

/**
 * @description: VNode 类型
 */
export interface VNode {
  __v_isVNode: true
  key: any
  type: any
  props: any
  children: any
  shapeFlag: number
}

/**
 * @description: 判断是否为虚拟节点
 * @param {any} value
 * @return {boolean}
 */
export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode === true : false
}

/**
 * @description: 创建一个虚拟节点
 * @param type vnode.type
 * @param props 标签属性或自定义属性
 * @param children? 子节点
 * @returns vnode 对象
 */
export function createVNode(type: any, props: any, children?: any): VNode {
  // 1. 二进制处理 shapeFlag 类型
  let shapeFlag: number
  if (isString(type)) {
    shapeFlag = ShapeFlags.ELEMENT
  } else if (isObject(type)) {
    shapeFlag = ShapeFlags.STATEFUL_COMPONENT
  } else {
    shapeFlag = 0
  }

  return createBaseVNode(type, props, children, shapeFlag)
}

/**
 * 构建基础 vnode
 */
function createBaseVNode(
  type: any,
  props: any,
  children: unknown,
  shapeFlag: number,
) {
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    shapeFlag,
    key: props?.key || null,
  } as VNode

  normalizeChildren(vnode, children)

  return vnode
}

/**
 * @description: 规范化子节点
 * @return {*}
 */
export function normalizeChildren(vnode: VNode, children: unknown) {
  // 依据当前 children 状态进行解析
  let type = 0
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (isObject(children)) {
    // 对象进行处理
  } else if (isFunction(children)) {
    // 函数进行处理
  } else {
    // 为 String
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  }

  // 修改 vnode 的 children
  vnode.children = children

  // 按位赋值
  vnode.shapeFlag |= type
}
