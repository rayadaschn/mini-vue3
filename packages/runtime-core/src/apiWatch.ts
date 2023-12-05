import { ReactiveEffect, isReactive } from 'reactivity'
import { EMPTY_OBJ, hasChanged, isObject } from 'shared'
import { queuePreFlushCb } from 'vue'

/**
 * watch 配置属性
 */
export interface WatchOptions {
  immediate?: boolean
  deep?: boolean
}

/**
 * @description: 创建一个 watch 函数
 * @param {*} source 监听的响应性数据
 * @param {function} cb 回调函数
 * @param {WatchOptions} options 配置参数
 * @return {*}
 */
export function watch(source: any, cb: () => void, options?: WatchOptions) {
  return doWatch(source as any, cb, options)
}

export function doWatch(
  source: any,
  cb?: (newVal: any, oldVal: any) => any,
  { immediate, deep }: WatchOptions = EMPTY_OBJ,
) {
  // 触发 getter 函数
  let getter: () => any

  // 判断 source 的数据类型
  if (isReactive(source)) {
    // 指定 getter
    getter = () => source
    // 深度
    deep = true
  } else {
    getter = () => {}
  }

  // 存在回调函数和deep
  if (cb && deep) {
    // TODO
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  // 旧值
  let oldValue = {}
  // job 执行方法
  const job = () => {
    if (cb) {
      // watch(source, cb)
      const newValue = effect.run()
      if (deep || hasChanged(newValue, oldValue)) {
        cb(newValue, oldValue)
        oldValue = newValue
      }
    }
  }

  // 调度器
  const scheduler = () => queuePreFlushCb(job)

  const effect = new ReactiveEffect(getter, scheduler)

  if (cb) {
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    effect.run()
  }

  return () => {
    effect.stop()
  }
}

/**
 * 依次执行 getter，从而触发依赖收集
 */
export function traverse(value: unknown, seen?: Set<unknown>) {
  if (!isObject(value)) {
    return value
  }
  seen = seen || new Set()

  seen.add(value)

  for (const key in value as object) {
    traverse((value as any)[key], seen)
  }
  return value
}
