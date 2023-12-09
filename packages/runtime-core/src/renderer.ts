import { ShapeFlags } from 'shared'
import { Comment, Fragment, Text } from './vnode'

/** 渲染器配置对象 */
export interface RendererOptions {
  /** 为指定 element 的 prop 打补丁 */
  patchProp(el: Element, key: string, preValue: any, nextValue: any): void

  /** 为指定的 Element 设置 text */
  setElementText(node: Element, text: string): void

  /** 插入指定的 el 到 parent 中，anchor 表示插入的位置(锚点) */
  insert(el: any, parent: Element, anchor?: any): void

  /** 创建指定的 Element */
  createElement(type: any): Element
}

/** 对外暴露的创建渲染器的方法 */
export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

/**
 * @description: 创建一个 renderer 渲染器
 * @param {RendererOptions} options 兼容性操作配置对象
 */
function baseCreateRenderer(options: RendererOptions): any {
  /**
   * @description: 解构 options，获取所有的兼容性方法
   */
  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
  } = options

  /**
   * @description: Element 的打补丁操作
   */
  const processElement = (
    oldVNode: null,
    newVNode: any,
    container: any,
    anchor: any,
  ) => {
    if (oldVNode == null) {
      mountElement(newVNode, container, anchor) // 挂载创建
    } else {
      // TODO: 更新操作
    }
  }

  /**
   * @description: element 的挂载操作
   * @param {*} vnode 新的虚拟节点
   * @param {*} container 容器
   * @param {*} anchor 锚点
   */
  const mountElement = (
    vnode: {
      e?: any
      children?: any
      type?: any
      props?: any
      shapeFlag?: any
    },
    container: Element,
    anchor: any,
  ) => {
    const { type, props, shapeFlag } = vnode

    // 1. 创建 element
    const el = (vnode.e = hostCreateElement(type))

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 2. 设置文本
      hostSetElementText(el, vnode.children as string)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // TODO: 设置 Array 子节点
    }

    // 3. 设置 props
    if (props) {
      // 遍历 props 对象
      for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
          hostPatchProp(el, key, null, props[key])
        }
      }
    }

    // 4. 插入 el 到指定为止
    hostInsert(el, container, anchor)
  }

  /** 打补丁操作 */
  const patch = (
    oldVNode: any,
    newVNode: { type: any; shapeFlag: any },
    container: any,
    anchor = null,
  ) => {
    if (oldVNode === newVNode) return // 未更新

    const { type, shapeFlag } = newVNode

    switch (type) {
      case Text:
        break
      case Comment:
        break
      case Fragment:
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(oldVNode, newVNode, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // TODO
        }
        break
    }
  }

  const render = (
    vnode: { type: any; shapeFlag: any } | null,
    container: { _vnode: any },
  ) => {
    if (vnode == null) {
      // TODO: 卸载
    } else {
      // 打补丁（包括了挂载和更新）
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }
  return {
    render,
  }
}
