import { baseParse } from './parse'
import { transform } from './transform'
import { transformElement } from './transforms'

export function baseCompile(template: string, options: any = {}) {
  /** 简单处理模版俩侧空格 */
  const ast = baseParse(template.trim())

  console.log(JSON.stringify(ast))

  transform(
    ast,
    Object.assign(options, {
      nodeTransforms: [transformElement],
    }),
  )

  return {}
}
