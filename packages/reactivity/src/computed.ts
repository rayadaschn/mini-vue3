import { isFunction } from 'shared'
import { Dep } from './dep'
import { ReactiveEffect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'

export function computed(getterOrOptions: any) {
  let getter

  const onlyGetter = isFunction(getterOrOptions)

  if (onlyGetter) {
    getter = getterOrOptions
  }

  const cRef = new ComputedRefImpl(getter)

  return cRef
}

/**
 * @description: 创建一个 computed
 */
export class ComputedRefImpl<T = unknown> {
  public dep?: Dep = undefined
  private _value!: T

  public readonly effect: ReactiveEffect<T>
  public readonly __v_isRef = true

  public _dirty = true // 脏状态

  constructor(getter: () => T) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
        triggerRefValue(this) // 调度器触发
      }
    })
    this.effect.computed = this
  }

  public get value(): T {
    trackRefValue(this)
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
}
