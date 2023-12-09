// 对应 vue3 源码: https://github.com/vuejs/core/blob/main/packages/runtime-dom/src/nodeOps.ts

/**
 * @description: 操作 DOM 元素的方法
 */
export const nodeOps = {
  /** description: 插入指定元素到指定位置 */
  insert: (childNode: any, parentNode: any, anchor: any) => {
    // anchor 为 null 则 childNode 将被插入到子节点的末尾
    parentNode.insertBefore(childNode, anchor || null) // Node.insertBefore() 方法在参考节点之前插入一个拥有指定父节点的子节点。
  },

  /** @description: 创建知道 Element */
  createElement: (tag: any): Element => {
    const el = document.createElement(tag)
    return el
  },

  /** 为指定的 element 设置 textContent */
  setElementText: (el: Element, text: string) => {
    el.textContent = text
  },
}
