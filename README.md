# mini-vue

[![Author: Huy](https://img.shields.io/badge/Author-Huy-yellow)](https://github.com/rayadaschn)
[![License](https://img.shields.io/badge/LICENSE-CC--BY--SA--4.0-yellow)](https://creativecommons.org/licenses/by-sa/4.0/)

---

手写 Vue3 源码: 😊 monorepo + 🚀 rollup + 🤘 Typescript

> [!WARNING]
> This project is unfinished and heavily work in progress.

Project D 目标：最精简的 Vue3 实现，最小拆分，逐行注释，彻底理清 Vue3 运行逻辑。

- [x] 实现 reactive 复杂类型响应性
- [x] 实现 ref 复杂类型响应性 & 简单数据类型响应性
- [x] 实现 computed 响应性
- [x] 实现 watch 数据监听器
- [x] 实现 h 函数
- [x] 实现 render 渲染函数
- [ ] 实现编译器
- [ ] 详细文档注解（待完成 ing）

## 关键点-整体脉络梳理

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

更新 patchElement 过程。分为 patchChildren 更新子节点和 patchProps 更新节点 Props 属性两个过程:

- patchChildren 更新子节点：

  1. 提取新旧节点的 children 和 shapeFlag 开始对比：
  2. 对新子节点进行条件判断：

     1. 新子节点为 TEXT_CHILDREN

        1. 旧子节点为 ARRAY_CHILDREN --> 卸载旧节点
        2. 旧节点不为 ARRAY_CHILDREN，但新旧子节点不同 --> 挂载更新文本

     2. 新子节点不为 TEXT_CHILDREN
        1. 旧子节点为 ARRAY_CHILDREN
           1. 新子节点也为 ARRAY_CHILDREN --> Diff 运算对比
           2. 新子节点不为 ARRAY_CHILDREN --> 直接卸载旧子节点
        2. 旧子节点为不为 ARRAY_CHILDREN
           1. 旧子节点为 TEXT_CHILDREN --> 删除旧的文本
           2. 新子节点为 ARRAY_CHILDREN --> 单独挂载新子节点操作

  ![patchChildren](https://cdn.jsdelivr.net/gh/rayadaschn/blogImage@master/img/202312101013876.png)

- patchProps 更新节点 Props 属性：
  新旧 props 不相同时才进行更新处理。

  1. 对新旧 props 进行对比判断，若 props 相同则退出不继续更新；
  2. 遍历新的 props，依次触发 hostPatchProp ，赋值新属性；
  3. 若存在旧的 props，遍历剔除新 props 中不存在的旧属性。

  为一个 DOM 设置对应 Props 属性(暂不考虑 event 等特殊属性)时，可以分为：`HTML Attributes` 和 `DOM Properties` 俩种情况。

  - `HTML Attributes` 表示的是定义在 HTML 标签上的属性，是标记语言中的一部分。它们用于定义元素的初始值，但一旦页面加载完成，它们通常**不再改变**。

    ```html
    <!-- 这个 html 上的 「class="HTML-Attributes"」 为 HTML Attributes -->
    <div class="HTML-Attributes"></div>
    ```

  - `DOM Properties` 表示的是 DOM 对象上的属性，是通过 JavaScript 在运行时对 DOM 元素进行操作和访问的。它们代表着当前文档中**元素的实时状态**。

    ```js
    // 获取一个 DOM 对象 el
    const el = document.querySelector('textarea')
    // 此时可以获取 DOM 对象 el 上的属性
    console.log('class 属性': el.className) // className
    console.log('type 属性': el.type) // textarea
    console.log('value 属性': el.value) // 在 textarea 上的 value 值，这个 value 并不存在 HTML 的 Attributes 属性上
    ```

  - 俩者设置获取属性名的方式并不相同，有些也无法获取到对方的属性：

    1. 如 class 的获取:
       - HTML Attributes：`target.getAttribute('class')`
       - DOM Properties：`target.className`
    2. 如 type 的获取:
       - HTML Attributes：`target.getAttribute('type')`
       - DOM Properties：「无法获取」
    3. 如 textarea 的 value 的获取:
       - HTML Attributes：「无法获取」
       - DOM Properties：`target.value`

  - 效率也不同，以获取 class 属性为例，DOM 的获取效率要远高于 HTML 的原生获取（猜测原因是 HTML 上的属性比 DOM 的多的多）。
  - 在 vue3 中组件通信里面也有 `props` (Properties)和 `attrs` (Attributes)俩种，其实同上面也是类似的

  patchEvent 解析: TODO 解析 `_vei` 的作用。

- 组件的挂载:

  组件的挂载，其实也就是组件的渲染，渲染的时机是组件的挂载，渲染的时机是组件的挂载，渲染的时机是组件的挂载，重要的事情说三遍。

  首先区分情况，若是没有 oldVNode，则直接挂载：

  1. 生成组件实例:

     ```js
     const instance = {
       uid: uid++, // 唯一标记
       vnode, // 虚拟节点
       type, // 组件类型
       subTree: null!, // render 函数的返回值
       effect: null!, // ReactiveEffect 实例
       update: null!, // update 函数，触发 effect.run
       render: null, // 组件内的 render 函数
       // 生命周期相关
       isMounted: false, // 是否挂载
       bc: null, // beforeCreate
       c: null, // created
       bm: null, // beforeMount
       m: null, // mounted
     }
     ```

  2. 组件渲染：
     这时要处理生命周期钩子函数了，首先区分组件是否已经挂载，若已经挂载了，则执行的是更新操作👇🏻。

     首先从刚刚生成的组件实例中获取生命周期钩子函数，然后依次执行，这里要注意的是，在执行生命周期钩子函数的时候，会传入一个 `ctx` 参数，这个参数就是组件实例，所以，在生命周期钩子函数中，可以访问到组件实例上的属性和方法。

     ```js
     // 执行 beforeCreate 生命周期钩子函数
     if (instance.bc) {
       instance.bc.call(instance.ctx)
     }
     ```

     组件的更新操作：

     实质 render 函数的再次触发，更新了节点内容，而后获得 nextTree，并且再保存对应的 subTree，以便进行更新操作。

     最后通过 patch 进行更新操作。

TODO: Diff 算法解析

### 编译器的实现

核心流程:

1. 解析器: 通过 parse 方法解析模板字符串，生成 AST 语法树；
2. 通过 transform 方法对 AST 语法树进行转换，生成 JavaScript AST，获得 codegenNode（用于生成代码节点）；
3. 通过 generate 方法将转换后的 AST 语法树生成 render 函数。

#### AST 抽象语法树

抽象语法树（abstract syntax tree或者缩写为 AST），是源代码的抽象语法结构的树状表现形式。

构建 AST 需要用到 有限状态机的概念，有限状态机（Finite-State Machine, FSM）是一种表示有限个状态以及在这些状态之间的转移和动作等行为的数学模型。

通过利用有限自动状态机的状态迁移，来获取 tokens 的过程，叫做对模版的标记化。

生成 AST 对象的过程较为复杂，但可以拆解为三个步骤：

1. 构建 parse 方法，生成 context 实例；
2. 构建 parseChildren 方法，处理所有子节点：

   1. 构建有限自动状态机解析模版
   2. 扫码 token 生成 AST 结构

3. 生成 AST 结构
