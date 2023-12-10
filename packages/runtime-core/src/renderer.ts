import { EMPTY_OBJ, ShapeFlags } from 'shared'
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
   * @description: Element 打补丁的处理过程
   */
  const processElement = (
    oldVNode: null,
    newVNode: any,
    container: any,
    anchor: any,
  ) => {
    if (oldVNode == null) {
      // 挂载创建
      mountElement(newVNode, container, anchor)
    } else {
      // 更新操作
      patchElement(oldVNode, newVNode)
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
      el?: any
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
    const el = (vnode.el = hostCreateElement(type))

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

  /**
   * @description: Element 的更新操作
   */
  const patchElement = (oldVNode: any, newVNode: any) => {
    // 获取指定的 el
    const el = (newVNode.el = oldVNode.el!)

    // 新旧 props
    const oldProps = oldVNode.props || EMPTY_OBJ
    const newProps = newVNode.props || EMPTY_OBJ

    // 更新子节点
    patchChildren(oldVNode, newVNode, el, null)

    // TODO: 更新 props
    patchProps(el, newVNode, oldProps, newProps)
  }

  /**
   * @description: 为子节点打补丁
   */
  const patchChildren = (
    oldVNode: any,
    newVNode: any,
    container: Element,
    anchor: null,
  ) => {
    // 1. 获取新旧节点的 children 和 shapeFlag
    const c1 = oldVNode && oldVNode.children // 旧节点的 children
    const prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0 // 旧节点的 prevShapeFlag

    const c2 = newVNode.children // 新节点的 children
    const { shapeFlag } = newVNode // 新节点的 shapeFlag

    // 2. 对新子节点进行条件判断
    // 2.1 新子节点为 TEXT_CHILDREN
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 2.1.1 旧子节点为 ARRAY_CHILDREN --> 卸载旧节点
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // TODO: 卸载旧子节点
      }

      // 2.1.2 旧节点不为数组，但新旧子节点不同 --> 挂载更新文本
      if (c2 !== c1) {
        // 挂载新子节点的文本
        hostSetElementText(container, c2 as string)
      }
    } else {
      // 2.2 新子节点不为 TEXT_CHILDREN

      // 2.2.1 旧子节点为 ARRAY_CHILDREN
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // A. 新子节点也为 ARRAY_CHILDREN
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // diff 运算 对比
          // TODO
          console.log('diff 算法对比, anchor 为:', anchor)
        } else {
          // B. 新子节点不为 ARRAY_CHILDREN，则直接卸载旧子节点
          // TODO: 卸载
        }
      }

      // 2.2.2 旧子节点为不为 ARRAY_CHILDREN
      else {
        // A. 旧子节点为 TEXT_CHILDREN
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 删除旧的文本
          hostSetElementText(container, '')
        }

        // B. 新子节点为 ARRAY_CHILDREN
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: 单独挂载新子节点操作
        }
      }
    }
  }

  /**
   * @description: 为 props 属性打补丁
   */
  const patchProps = (
    el: Element,
    _vnode: any,
    oldProps: { readonly [x: string]: any },
    newProps: { [x: string]: any },
  ) => {
    // 新旧 props 不相同时才进行处理
    if (oldProps !== newProps) {
      // 遍历新的 props，依次触发 hostPatchProp ，赋值新属性
      for (const key in newProps) {
        const next = newProps[key]
        const prev = oldProps[key]
        if (next !== prev) {
          hostPatchProp(el, key, prev, next)
        }
      }

      // 若存在旧的 props，遍历剔除新 props 中不存在的旧属性
      if (oldProps !== EMPTY_OBJ) {
        // 遍历旧的 props，依次触发 hostPatchProp ，删除不存在于新 props 中的旧属性
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  /** 打补丁操作 main */
  const patch = (
    oldVNode: any,
    newVNode: { type: any; shapeFlag: any },
    container: any,
    anchor = null,
  ) => {
    if (oldVNode === newVNode) return // 未更新

    const { type, shapeFlag } = newVNode

    // 虚拟节点类型判断
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

  /**
   * @description: 待导出的 render 渲染函数
   */
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
