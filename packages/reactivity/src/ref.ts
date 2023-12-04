import { Dep, createDep } from './dep'
import { activeEffect, trackEffects } from './effect'
import { toReactive } from './reactive'

export interface Ref<T = any> {
  value: T
}

export function ref(value?: unknown) {
  return createRef(value, false)
}

export function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }

  return new RefImpl(rawValue, shallow)
}

/**
 * @description: 创建一个 Ref
 * @return {*}
 */
class RefImpl<T> {
  private _value: T
  public dep?: Dep = undefined
  public readonly __v_isRef = true

  constructor(
    value: T,
    public readonly __v_isShallow: boolean, // 是否为复杂类型
  ) {
    this._value = __v_isShallow ? value : toReactive(value)
  }

  /**
   * @description: 获取 value 属性时返回 _value 值
   */
  public get value(): T {
    trackRefValue(this) // 收集依赖
    return this._value
  }

  /**
   * @description: 设置 value 属性时, 操作
   * @param {T} v
   */
  public set value(v: T) {
    this._value = v
  }
}

/**
 * @description: 依赖收集
 * @param {*} ref
 * @return {*}
 */
export function trackRefValue(ref: any) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

/**
 * @description: 判断是否为 Ref
 * @param {any} r
 * @return {boolean}
 */
export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true)
}
