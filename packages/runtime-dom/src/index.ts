import { createRenderer } from 'runtime-core/src/renderer'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

/**
 * @description: 合并俩个对象
 */
const rendererOptions = Object.assign({ patchProp }, nodeOps)

let renderer: any

function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}

/**
 * @description: 对外导出 render
 * @param {array} args
 */
export const render = (...args: any[]) => {
  ensureRenderer().render(...args)
}
