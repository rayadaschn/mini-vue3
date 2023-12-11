type AnyFunction = (...args: any[]) => any
type EventValue = AnyFunction | AnyFunction[]

interface Invoker extends EventListener {
  value: EventValue
}

/**
 * 为 event 事件进行打补丁
 */
export function patchEvent(
  el: Element & { _vei?: Record<string, Invoker | undefined> },
  rawName: string,
  _prevValue: EventValue | null,
  nextValue: EventValue | null,
) {
  // vei = vue event invokers
  const invokers = el._vei || (el._vei = {})

  /** 是否存在缓存事件 */
  const existingInvoker = invokers[rawName]

  // 如果当前事件存在缓存，并且存在新的事件行为，则判定为更新操作。直接更新 invoker 的 value 即可
  if (nextValue && existingInvoker) {
    // patch 更新行为
    existingInvoker.value = nextValue
  } else {
    /** 获取用于 addEventListener || removeEventListener 的事件名 */
    const name = parseName(rawName)

    // 俩种情形: 新增和删除
    if (nextValue) {
      /** 新增: 添加事件监听 */
      const invoker = (invokers[rawName] = createInvoker(nextValue))
      el.addEventListener(name, invoker)
    } else if (existingInvoker) {
      // 移除事件监听
      el.removeEventListener(name, existingInvoker)

      // 删除缓存
      invokers[rawName] = undefined
    }
  }
}

/**
 * 处理字符串：去除开头 ‘on’ 字符串，并以小驼峰返回
 */
function parseName(name: string) {
  return name.slice(2).toLowerCase()
}

/**
 * 创建 invoker 函数
 */
function createInvoker(initialValue: any) {
  const invoker = () => {
    invoker.value && invoker.value()
  }
  // value 为真实的事件行为
  invoker.value = initialValue
  return invoker
}
