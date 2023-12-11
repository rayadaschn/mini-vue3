import { ShapeFlags, isArray, isFunction, isObject, isString } from 'shared'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')
export const Comment = Symbol('Comment')

interface classObject {
  [key: string]: any
}

/**
 * @description: VNode 类型
 */
export interface VNode {
  __v_isVNode: true
  key: any
  type: any
  props: { [x: string]: any }
  el: any
  children: any
  shapeFlag: number
  parentNode?: any
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
  // 1. 对 props 属性(class 和 style)进行增强处理
  if (props) {
    const { class: klass } = props
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
  }

  // 2. 二进制处理 shapeFlag 类型
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
 * @description: 对 class 进行增强处理
 * @param {unknown} val
 * @return {string}
 */
export function normalizeClass(val: unknown): string {
  let res = ''

  if (isString(val)) {
    // 判断是否为 string，如果是 string 就不需要专门处理
    res = val
  } else if (isArray(val)) {
    // 判断为数组，进行循环增强遍历
    for (let i = 0; i < val.length; i++) {
      const normalized = normalizeClass(val[i])
      if (normalized) {
        res += normalized + ' ' // 空格分割
      }
    }
  } else if (isObject(val)) {
    // 判断为对象，依次进行遍历进行增强处理
    for (const name in val as classObject) {
      if (Object.prototype.hasOwnProperty.call(val, name)) {
        if ((val as classObject)[name]) {
          // 对该值进行判断, 为 true 才加入
          res += name + ' ' // 空格分割
        }
      }
    }
  }

  // 去除左右空格
  return res.trim()
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

/**
 * @description: 简单区分是否为同类型节点: 依据 key 和 type
 * @param {VNode} n1
 * @param {VNode} n2
 * @return {boolean}
 */
export function isSameVNodeType(n1: VNode, n2: VNode): boolean {
  return n1.type === n2.type && n1.key === n2.key
}
