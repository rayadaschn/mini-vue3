import { generate } from './codegen'
import { baseParse } from './parse'
import { transform } from './transform'
import { transformElement, transformText } from './transforms'

export function baseCompile(template: string, options: any = {}) {
  /** 简单处理模版俩侧空格后，生成 基本 AST */
  const ast = baseParse(template.trim())

  // 根据 AST 生成 JavaScript AST
  transform(
    ast,
    Object.assign(options, {
      nodeTransforms: [transformElement, transformText],
    }),
  )

  console.log(JSON.stringify(ast))

  return generate(ast)
}
