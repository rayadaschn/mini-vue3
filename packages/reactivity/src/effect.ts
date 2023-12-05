import { isArray } from 'shared'
import { Dep, createDep } from './dep'
import { ComputedRefImpl } from './computed'

type KeyToDepMap = Map<any, Dep>

export type EffectScheduler = (...args: any[]) => any
export interface ReactiveEffectOptions {
  lazy?: boolean
  scheduler?: EffectScheduler
}

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

  // 依次触发依赖: 俩个 for 循环先执行计算属性的 trigger 再触发非计算属性的 trigger
  // 原因在于，若是计算属性的 trigger 在后面执行，则由于 dirty 的改变可能导致死循环出现
  // 通过调用两次 for 循环，让计算属性的 trigger 都在前面执行，避免产生 bug
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect)
    }
  }

  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect)
    }
  }
}

/**
 * @description: 触发指定依赖
 * @param {ReactiveEffect} effect
 * @return {*}
 */
export function triggerEffect(effect: ReactiveEffect) {
  if (effect.scheduler) {
    effect.scheduler() // 优先执行调度器
  } else {
    effect.run()
  }
}

export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions) {
  const _effect = new ReactiveEffect(fn)

  if (!options || !options.lazy) {
    _effect.run()
  }
}

/**
 * @description: 响应式触发依赖
 * @param {function} fn
 * @param {EffectScheduler | null} scheduler 调度器, 对应执行 computed 响应依赖
 */
export class ReactiveEffect<T = any> {
  public computed?: ComputedRefImpl<T>
  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null, // 调度器，若存在则执行 computed 响应依赖
  ) {}
  run() {
    activeEffect = this as ReactiveEffect<any>
    return this.fn()
  }

  stop() {}
}
