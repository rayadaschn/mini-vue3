import { baseParse } from './parse'

export function baseCompile(template: string, options: any) {
  const ast = baseParse(template)

  console.log(JSON.stringify(ast))
  console.log(options)

  return {}
}
