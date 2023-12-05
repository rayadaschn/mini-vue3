let isFlushPending = false // 初始状态

const resolvePromise = Promise.resolve() as Promise<any>

let currentFlushPromise: Promise<void> | null = null

const pendingPreFlushCbs: Array<() => void> = []

export function queuePreFlushCb(cb: () => void) {
  queueCb(cb, pendingPreFlushCbs)
}

function queueCb(cb: () => void, pendingQueue: Array<() => void>) {
  pendingQueue.push(cb)
  queueFlushCb()
}

function queueFlushCb() {
  if (!isFlushPending) {
    isFlushPending = true // 改变状态
    currentFlushPromise = resolvePromise.then(() => {
      flushJobs()
    })
    console.log('currentFlushPromise', currentFlushPromise)
  }
}

/**
 * @description: 处理队列, 实际执行的函数
 */
function flushJobs() {
  isFlushPending = false // 处理队列, 重置状态
}

/**
 * @description: 循环对队列进行处理
 */
export function flushPreFlushCbs() {
  if (pendingPreFlushCbs.length) {
    const activePreFlushCbs = [...new Set(pendingPreFlushCbs)] // 去重
    pendingPreFlushCbs.length = 0

    for (let i = 0; i < activePreFlushCbs.length; i++) {
      activePreFlushCbs[i]()
    }
  }
}
