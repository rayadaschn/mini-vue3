// 对应 promise 的 pending 状态
let isFlushPending = false

/**
 * promise.resolve()
 */
const resolvedPromise = Promise.resolve() as Promise<any>
/**
 * 当前的执行任务
 */
let currentFlushPromise: Promise<void> | null = null

/**
 * 待执行的任务队列
 */
const pendingPreFlushCbs: Array<() => void> = [] // 初始为空

/**
 * 队列预处理函数 ->> 核心 api
 */
export function queuePreFlushCb(cb: () => void) {
  queueCb(cb, pendingPreFlushCbs)
}

/**
 * 队列处理函数
 */
function queueCb(cb: () => void, pendingQueue: Array<() => void>) {
  // 将所有的回调函数，放入队列中
  pendingQueue.push(cb)
  queueFlush()
}

/**
 * 依次处理队列中执行函数
 */
function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true // 改变执行状态
    currentFlushPromise = resolvedPromise.then(flushJobs)
    console.log('currentFlushPromise', currentFlushPromise)
  }
}

/**
 * 处理队列
 */
function flushJobs() {
  isFlushPending = false // 恢复状态, 可继续执行
  flushPreFlushCbs()
}

/**
 * 依次处理队列中的任务
 */
export function flushPreFlushCbs() {
  if (pendingPreFlushCbs.length) {
    // 去重
    const activePreFlushCbs = [...new Set(pendingPreFlushCbs)]
    // 清空就数据
    pendingPreFlushCbs.length = 0
    // 循环处理
    for (let i = 0; i < activePreFlushCbs.length; i++) {
      activePreFlushCbs[i]()
    }
  }
}
