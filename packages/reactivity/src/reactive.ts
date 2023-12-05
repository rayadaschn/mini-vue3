import { isObject } from 'shared'
import { mutableHandlers } from './baseHandler'
import { ReactiveFlags } from './constants'

/**
 * @description: 响应性 Map 缓存对象
 * @return {*}
 */
export const reactiveMap = new WeakMap<object, any>()

/**
 * @description: 为复杂数据类型，创建响应性对象
 * @param target 被代理对象
 * @returns 代理对象
 */
export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

/**
 * @description: 创建一个响应式对象
 * @return {*} 对象代理
 */
function createReactiveObject(
  target: object,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<object, any>,
) {
  // 如果该实例已经被代理，则直接读取即可
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  // 未被代理则生成 proxy 实例
  const proxy = new Proxy(target, baseHandlers)
  // 为 Reactive 增加标记
  proxy[ReactiveFlags.IS_REACTIVE] = true
  // 缓存代理对象
  proxyMap.set(target, proxy)
  return proxy
}

/**
 * @description: 转换为 reactive 响应式
 * @param {*} T
 * @return {*}
 */
export const toReactive = <T>(value: T): T => {
  return isObject(value) ? reactive(value as object) : value
}

/**
 * @description: 判断是否为 reactive 响应式
 * @return {boolean}
 */
export function isReactive(value: any): boolean {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}
