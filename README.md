# mini-react

[![Author: Huy](https://img.shields.io/badge/Author-Huy-yellow)](https://github.com/rayadaschn)
[![License](https://img.shields.io/badge/LICENSE-CC--BY--SA--4.0-yellow)](https://creativecommons.org/licenses/by-sa/4.0/)

---

手写 Vue3 源码: 😊 monorepo + 🚀 rollup + 🤘 Typescript

- [x] 实现 reactive 复杂类型响应性
- [x] 实现 ref 复杂类型响应性
- [x] 实现 ref 简单数据类型响应性
- [ ] 实现 computed

## 关键点

### ref 和 reactive 实现

ref 同 reactive 的区别在于，ref 能够实现简单数据类型的响应性处理。而简单数据类型不具备数据监听的条件（不能用 Proxy 的属性调用），Vue3 是通过 `get value()` 和 `set value()`，即“存取器”（Accessor）属性把函数调用变成了属性调用的形式，让开发者主动调用该函数，来实现“类似于”响应性的结果。

- ref 函数是如何实现的？
  - ref 函数本质上是生成了一个 RefImpl 类型的实例对象，通过 get 和 set 标记处理 value 函数。
- 为什么 ref 类型的数据必须通过 `.value` 访问其值?
  - 因为 ref 需要处理简单数据类型的响应性，但对于简单数据类型而言，它无法通过 proxy 简历代理。因此，Vue3 是通过 `get value()` 和 `set value()`，即“存取器”（Accessor）属性把函数调用变成了属性调用的形式，让开发者主动触发这俩个函数，来完成依赖收集和触发依赖。

### computed 实现

在 computed 中引入 dirty 脏状态，表示数据发生了变化，需要进行重新渲染的状态。这个脏标志有助于优化性能，因为Vue不会在每次数据变化时立即进行重新渲染，而是在下一个事件循环中进行。这样，如果多个数据变化在同一个事件循环中发生，Vue 可以将它们合并为一次更新，减少不必要的重复渲染。
