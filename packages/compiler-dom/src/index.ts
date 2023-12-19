import { baseCompile } from 'compiler-core/src/compile'

export function compile(template: string, options: any = {}): string {
  // 合并默认配置和用户配置
  const finalOptions = Object.assign({}, options, {
    prefixIdentifiers: true,
  })

  // 调用 baseCompile 函数进行编译
  const compiled = baseCompile(template, finalOptions)

  // 返回编译后的代码字符串
  return compiled && ''
}
