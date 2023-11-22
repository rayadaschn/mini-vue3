import path from 'path'
import fs from 'fs'

import ts from 'rollup-plugin-typescript2'
import cjs from '@rollup/plugin-commonjs'

/** 所有包的路径 */
const pkgPath = path.resolve(__dirname, '../../packages')

/** 打包路径 */
const distPath = path.resolve(__dirname, '../../dist/node_modules')

/** 获取包路径，区分是否打包 */
export const resolvePkgPath = (pkgName, isDist) => {
  if (isDist) {
    return `${distPath}/${pkgName}`
  } else {
    return `${pkgPath}/${pkgName}`
  }
}

/** 获取包 JSON 内容 */
export const getPackageJSON = (pkgName) => {
  const path = `${resolvePkgPath(pkgName)}/package.json`
  const str = fs.readFileSync(path, { encoding: 'utf-8' })

  return JSON.parse(str)
}

/** 获取基础 Rollup 打包插件 */
export const getBaseRollupPlugins = ({ typescript = {} } = {}) => {
  return [cjs(), ts(typescript)]
}
