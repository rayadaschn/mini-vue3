type KeyToDepMap = Map<any, ReactiveEffect>

export let activeEffect: ReactiveEffect | undefined

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
  if (!activeEffect) return // 若当前不存在执行函数，则直接 return

  // 尝试从 targetMap 中，根据 target 获取 map
  let depsMap = targetMap.get(target)

  // 若获取到的 map 不存在, 则生成新的 map 对象, 并吧该对象赋值给对应的 value
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  // 为指定 map, 指定 key 设置回调函数
  depsMap.set(key, activeEffect)
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

  const effect = depsMap.get(key) as ReactiveEffect

  if (!effect) return // 若该无该属性的依赖触发函数, 则也直接 return

  effect.run() // 存在触发函数, 则执行
  console.log('触发依赖函数', target, key, newValue)
}

export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}

export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}
  run() {
    activeEffect = this
    return this.fn()
  }
}
