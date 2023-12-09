# mini-react

[![Author: Huy](https://img.shields.io/badge/Author-Huy-yellow)](https://github.com/rayadaschn)
[![License](https://img.shields.io/badge/LICENSE-CC--BY--SA--4.0-yellow)](https://creativecommons.org/licenses/by-sa/4.0/)

---

手写 Vue3 源码: 😊 monorepo + 🚀 rollup + 🤘 Typescript

- [x] 实现 reactive 复杂类型响应性
- [x] 实现 ref 复杂类型响应性
- [x] 实现 ref 简单数据类型响应性
- [x] 实现 computed 响应性
- [x] watch 数据监听器
- [x] h 函数
- [ ] render 函数

## 关键点

### ref 和 reactive 实现

ref 同 reactive 的区别在于，ref 能够实现简单数据类型的响应性处理。而简单数据类型不具备数据监听的条件（不能用 Proxy 的属性调用），Vue3 是通过 `get value()` 和 `set value()`，即“存取器”（Accessor）属性把函数调用变成了属性调用的形式，让开发者主动调用该函数，来实现“类似于”响应性的结果。

- ref 函数实现原理
  - ref 函数本质上是生成了一个 RefImpl 类型的实例对象，通过 get 和 set 标记处理 value 函数。
- 为什么 ref 类型的数据必须通过 `.value` 访问其值?
  - 因为 ref 需要处理简单数据类型的响应性，但对于简单数据类型而言，它无法通过 proxy 简历代理。因此，Vue3 是通过 `get value()` 和 `set value()`，即“存取器”（Accessor）属性把函数调用变成了属性调用的形式，让开发者主动触发这俩个函数，来完成依赖收集和触发依赖。

### computed 实现

在 computed 中引入 dirty 脏状态，表示数据发生了变化，需要进行重新渲染的状态。这个脏标志有助于优化性能，因为 Vue 不会在每次数据变化时立即进行重新渲染，而是在下一个事件循环中进行。这样，如果多个数据变化在同一个事件循环中发生，Vue 可以将它们合并为一次更新，减少不必要的重复渲染。

实现关键:

- 计算属性的本质也是一个 ComputedRefImpl 的实例
- 在 ComputedRefImpl 中通过 dirty 变量来控制 run 的执行和 triggerRefValue 的触发
- 访问计算属性的值，需要通过 `.value`，是因为其内部也是通过和 ref 一样的 `get value` 来实现的
- 每次访问 `.value` 属性时，都会触发 trackRefValue 进行依赖收集
- 在依赖触发时，必须先触发 computed 的 effect，再触发非 computed 的 effect。即:

  ```js
  /**
   * 依次触发依赖，俩个 for 循环先执行计算属性的 trigger 再触发非计算属性的 trigger
   * 原因在于，若是计算属性的 trigger 在后面执行，则由于 dirty 的改变可能导致死循环出现
   * 通过调用两次 for 循环，让计算属性的 trigger 都在前面执行，避免产生 bug
   */
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect)
    }
  }

  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect)
    }
  }
  ```

### watch

Scheduler 调度器整体分为两块：控制执行顺序和控制执行规则（类似 Promise 具备异步执行功能）。此外，它还依赖一个 lazy 的懒执行的规则，用了控制是否执行 effect 副作用。

- 区别于 reactive 等响应性，watch 的依赖收集需要主动进行收集

### h 函数

`h` 函数是用于**创建**虚拟节点（Virtual Node）的函数，它是“hyperscript”的缩写。虚拟节点是一个轻量级的 JavaScript 对象，表示 DOM 中的节点结构。Vue3 使用虚拟节点来描述组件的结构，然后通过虚拟节点生成实际的 DOM 元素。

```js
// 导入 createApp 函数
import { createApp, h } from 'vue'

// 创建一个简单的组件
const MyComponent = {
  render() {
    // 使用 h 函数创建虚拟节点
    return h('div', { class: 'my-component' }, 'Hello, Vue 3!')
  },
}

// 创建应用程序
const app = createApp(MyComponent)

// 挂载应用程序到 DOM 元素
app.mount('#app')
```

- `h` 函数执行顺序是先子节点，再父节点。
- 一个 vnode 的核心字段示例:

  ```js
  const vnode = {
    __v_isVNode: true,
    type: 'p',
    shapeFlag: 9, // 标志位，表示不同的状态或特征
    children: 'p1',
  }
  ```

### render 函数

`render` 函数是**渲染函数**： `render` 函数是一个特殊的函数，用于生成虚拟 DOM。它接收一个上下文对象作为参数，通常包含组件的状态、属性等信息。`render` 函数的目标是返回一个虚拟节点，描述了组件的结构。`h` 函数通常在 `render` 函数中使用，用于创建虚拟节点。

实际过程:

在 `h` 函数创建好 VNode 后，会将其与上一次渲染时生成的 VNode 进行比较，找出两者之间的差异。这个过程称为虚拟 DOM 的补丁（patch）过程，负责更新实际 DOM 以反映新的状态。

> 若 VNode 为 null 则是卸载

patch 补丁操作过程：

1. 判断 newVNode 的类型进行不同的操作;
2. 若是普通文本则对 oldVNode 进行判断是否为空，若为空则进行 Element 的挂载操作，否则为更新；

挂载 mountElement 过程:

1. 创建 Element 元素
2. 若为文本则设置Element 元素的文本或设置 Array 子节点
3. 对 Element 元素设置 props 属性： 遍历 props 对象
4. 将 Element 元素插入到指定位置
