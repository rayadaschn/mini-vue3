import { baseParse } from './parse'

export function baseCompile(template: string, options: any = {}) {
  /** 简单处理模版俩侧空格 */
  const ast = baseParse(template.trim())

  console.log(JSON.stringify(ast))
  console.log(options)

  return {}
}
