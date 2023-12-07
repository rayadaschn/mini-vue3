/**
 * @description: 标志位，表示不同的状态或特征
 */
export const enum ShapeFlags {
  /** type = Element, 表示类型为 Element */
  ELEMENT = 1,

  /** 表示是函数组件 */
  FUNCTIONAL_COMPONENT = 1 << 1,

  /** 有状态（响应数据）组件 */
  STATEFUL_COMPONENT = 1 << 2,

  /** 表示子元素是文本 */
  TEXT_CHILDREN = 1 << 3,

  /** 表示子元素是数组 */
  ARRAY_CHILDREN = 1 << 4,

  /** 表示子元素是插槽 */
  SLOTS_CHILDREN = 1 << 5,

  /** 是一个组合标志，表示组件，其值是 STATEFUL_COMPONENT 和 FUNCTIONAL_COMPONENT 的按位或运算结果。表示有状态（响应数据）组件 | 函数组件 */
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}
