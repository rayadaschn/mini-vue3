import { isArray, isString } from 'shared'
import { NodeTypes } from './ast'
import { helperNameMap } from './runtimeHelpers'
import { getVNodeHelper } from './utils'
/**
 * @description: 根据 JavaScript AST 生成代码
 */
export function generate(ast: any) {
  // 生成上下文
  const context = createCodegenContext(ast)

  // 获取 code 的拼接方法
  const { push, newline, indent, deindent } = context

  // 生成函数的前置代码：const _Vue = Vue
  genFunctionPreamble(context)

  // 创建方法名称
  const functionName = `render`
  // 创建方法参数
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')

  // 利用方法名称和参数拼接函数声明
  push(`function ${functionName}(${signature}) {`)

  // 缩进 + 换行
  indent()

  // 增加 with 触发
  push(`with (_ctx) {`)
  indent()

  // 明确使用到的方法。如：createVNode
  const hasHelpers = ast.helpers.length > 0
  if (hasHelpers) {
    push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = _Vue`)
    push(`\n`)
    newline()
  }

  // 最后拼接 return 的值
  newline()
  push(`return `)
  // 处理 renturn 结果。如：_createElementVNode("div", [], [" hello world "])
  if (ast.codegenNode) {
    genNode(ast.codegenNode, context)
  } else {
    push(`null`)
  }

  // with 结尾
  deindent()
  push(`}`)

  // 收缩缩进 + 换行
  deindent()
  push(`}`)

  return {
    ast,
    code: context.code,
  }
}

const aliasHelper = (s: keyof typeof helperNameMap) =>
  `${helperNameMap[s]}: _${helperNameMap[s]}`

/**
 * @description: 生成 codegen 上下文
 */
function createCodegenContext(ast: any) {
  const context = {
    code: ``, // render 函数代码字符串
    runtimeGlobalName: 'Vue', // 运行时全局的变量名
    source: ast.loc.source, // 模板源头
    indentLevel: 0, // 缩进级别
    /** 插入代码 */
    push(source: string) {
      context.code += source
    },
    /** 需要触发的方法，关联 JavaScript AST 中的 helpers */
    helper(key: keyof typeof helperNameMap) {
      return `_${helperNameMap[key]}`
    },
    /** 插入新的一行 */
    newline() {
      newline(context.indentLevel)
    },
    /** 控制缩进 + 换行 */
    indent() {
      newline(++context.indentLevel)
    },
    /** 减少缩进 + 换行 */
    deindent() {
      newline(--context.indentLevel)
    },
  }

  function newline(n: number) {
    context.code += '\n' + `  `.repeat(n)
  }
  return context
}

/**
 * @description: 生成 vue 的前置代码
 * @param {*} context
 * @return {*}
 */
function genFunctionPreamble(context: any) {
  const { push, newline, runtimeGlobalName } = context

  const VueBinding = runtimeGlobalName
  push(`const _Vue = ${VueBinding}\n`)

  newline()
  push(`return `)
}

/**
 * 区分节点进行处理
 */
function genNode(node: any, context: any) {
  switch (node.type) {
    case NodeTypes.ELEMENT:
    case NodeTypes.IF:
      genNode(node.codegenNode!, context)
      break
    case NodeTypes.VNODE_CALL:
      genVNodeCall(node, context)
      break
    case NodeTypes.TEXT:
      genText(node, context)
      break
  }
}

/**
 * 处理 VNODE_CALL 节点
 */
function genVNodeCall(
  node: {
    type?: any
    codegenNode?: any
    tag?: any
    props?: any
    children?: any
    patchFlag?: any
    dynamicProps?: any
    isComponent?: any
  },
  context: any,
) {
  const { push, helper } = context
  const { tag, props, children, patchFlag, dynamicProps, isComponent } = node

  // 返回 vnode 生成函数
  const callHelper = getVNodeHelper(context.inSSR, isComponent)
  push(helper(callHelper) + `(`, node)

  // 获取函数参数
  const args = genNullableArgs([tag, props, children, patchFlag, dynamicProps])

  // 处理参数的填充
  genNodeList(args, context)

  push(`)`)
}

/**
 * 处理参数的填充
 */
function genNodeList(
  nodes: string | any[],
  context: {
    code?: string | undefined
    runtimeGlobalName?: string | undefined
    source?: any
    indentLevel?: number | undefined
    push: any
    helper?: any
    newline: any
    indent?: (() => void) | (() => void) | undefined
    deindent?: (() => void) | (() => void) | undefined
    inSSR?: any
  },
) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    // 字符串直接 push 即可
    if (isString(node)) {
      push(node)
    }
    // 数组需要 push "[" "]"
    else if (isArray(node)) {
      genNodeListAsArray(node, context)
    }
    // 对象需要区分 node 节点类型，递归处理
    else {
      genNode(node, context)
    }
    if (i < nodes.length - 1) {
      push(', ')
    }
  }
}

function genNodeListAsArray(nodes: any, context: any) {
  context.push(`[`)
  genNodeList(nodes, context)
  context.push(`]`)
}

/**
 * 处理 createXXXVnode 函数参数
 */
function genNullableArgs(args: any[]) {
  let i = args.length
  while (i--) {
    if (args[i] != null) break
  }
  return args.slice(0, i + 1).map((arg) => arg || `null`)
}

/**
 * 处理 TEXT 节点
 */
function genText(node: any, context: any) {
  context.push(JSON.stringify(node.content), node)
}
