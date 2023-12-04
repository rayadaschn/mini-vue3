import { isArray } from 'shared/src'
import { Dep, createDep } from './dep'

type KeyToDepMap = Map<any, Dep>

/**
 * @description: 检测是否添加 effect 响应回调函数
 */
export let activeEffect: ReactiveEffect | undefined = undefined

/**
 * @description: 收集所有依赖的 WeakMap 实例
 *  - key 为响应性对象
 *  - value 为 Map 对象
 * @return {*}
 */
const targetMap = new WeakMap<any, KeyToDepMap>()

/**
 * @description: 收集依赖方法
 * @param {object} target 为 WeakMap 的 key
 * @param {unknown} key 为 代理对象的 key,当依赖被触发时，需要依据该 key 获取
 * @return {*}
 */
export function track(target: object, key: unknown) {
  // 若当前不存在执行函数，则直接 return，如在添加执行函数前访问，则直接跳过。
  if (!activeEffect) return

  // 尝试从 targetMap 中，根据 target 获取 map
  let depsMap = targetMap.get(target)

  // 若获取到的 map 不存在, 则生成新的 map 对象, 并吧该对象赋值给对应的 value
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }

  trackEffects(dep)
  // 为指定 map, 指定 key 设置回调函数
  // depsMap.set(key, activeEffect)
}

/**
 * @description: 利用 dep 一次跟踪指定 key 的所有 effect
 * @return {*}
 */
export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}

/**
 * @description: 触发依赖
 * @param {object} target
 * @param {unknown} key
 * @param {unknown} newValue
 * @return {*}
 */
export function trigger(target: object, key: unknown, newValue: unknown) {
  const depsMap = targetMap.get(target)

  if (!depsMap) return // 若无触发依赖, 则直接 return

  // const effect = depsMap.get(key) as ReactiveEffect
  const dep: Dep | undefined = depsMap.get(key)

  if (!dep) return // 若该无该属性的依赖触发函数, 则也直接 return

  triggerEffects(dep)
  // effect.run() // 存在触发函数, 则执行
  console.log('触发依赖函数', target, key, newValue)
}

/**
 * @description: 依次触发 dep 中保存的依赖
 * @param {Dep} dep
 * @return {*}
 */
export function triggerEffects(dep: Dep) {
  const effects = isArray(dep) ? dep : [...dep]

  // 依次触发依赖
  for (const effect of effects) {
    triggerEffect(effect)
  }
}

/**
 * @description: 触发指定依赖
 * @param {ReactiveEffect} effect
 * @return {*}
 */
export function triggerEffect(effect: ReactiveEffect) {
  effect.run()
}

export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}

export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}
  run() {
    activeEffect = this as ReactiveEffect<any>
    return this.fn()
  }
}
