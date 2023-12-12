import { isFunction, isObject } from 'shared'
import { VNode } from './vnode'
import { reactive } from 'reactivity'

export interface Instance {
  uid: number
  vnode: VNode
  type: any
  subTree: never
  effect: never
  update: never
  render: any
  isMounted: boolean
  bc: null
  c: null
  bm: null
  m: null
  data?: any
}

/** 唯一标记 */
let uid = 0

/** 编辑器实例 */
let compile: any

/**
 * @description: 创建组件实例
 * @param {VNode} vnode
 */
export function createComponentInstance(vnode: VNode) {
  const type = vnode.type

  const instance: Instance = {
    uid: uid++, // 唯一标记
    vnode, // 虚拟节点
    type, // 组件类型
    subTree: null!, // render 函数的返回值
    effect: null!, // ReactiveEffect 实例
    update: null!, // update 函数，触发 effect.run
    render: null, // 组件内的 render 函数
    // 生命周期相关
    isMounted: false, // 是否挂载
    bc: null, // beforeCreate
    c: null, // created
    bm: null, // beforeMount
    m: null, // mounted
  }

  return instance
}

/** 规范化组件实例数据 */
export function setupComponent(instance: Instance) {
  // 为 render 赋值
  const setupResult = setupStatefulComponent(instance)
  return setupResult
}

function setupStatefulComponent(instance: Instance) {
  const Component = instance.type
  const { setup } = Component

  // 若存在 setup ，则直接获取 setup 函数的返回值即可
  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  } else {
    // 获取组件实例
    finishComponentSetup(instance)
  }
}

export function handleSetupResult(instance: Instance, setupResult: any) {
  // 存在 setupResult，并且它是一个函数，则 setupResult 就是需要渲染的 render
  if (isFunction(setupResult)) {
    instance.render = setupResult
  }
  finishComponentSetup(instance)
}

/**
 * @description: 获取组件实例
 * @param {Instance} instance
 */
export function finishComponentSetup(instance: Instance) {
  const Component = instance.type

  // 组件不存在 render 时，才需要重新赋值
  if (!instance.render) {
    // 存在编辑器，并且组件中不包含 render 函数，同时包含 template 模板，则直接使用编辑器进行编辑，得到 render 函数
    if (compile && !Component.render) {
      if (Component.template) {
        // 这里就是 runtime 模块和 compile 模块结合点
        const template = Component.template
        Component.render = compile(template)
      }
    }
    // 为 render 赋值
    instance.render = Component.render
  }

  // 改变 options 中的 this 指向
  applyOptions(instance)
}

function applyOptions(instance: any) {
  const { data: dataOptions } = instance.type

  // 存在 data 选项时
  if (dataOptions) {
    // 触发 dataOptions 函数，拿到 data 对象
    const data = dataOptions()
    // 如果拿到的 data 是一个对象
    if (isObject(data)) {
      // 则把 data 包装成 reactiv 的响应性数据，赋值给 instance
      instance.data = reactive(data)
    }
  }
}
