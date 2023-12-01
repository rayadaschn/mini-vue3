import { track, trigger } from './effect'

/**
 * @description: 创建 Getter 获取拦截操作
 * @return {*} 返回属性值
 */
function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    const result = Reflect.get(target, key, receiver)
    // 获取触发操作
    track(target, key)

    return result
  }
}

/**
 * @description: 创建 Setter 设置拦截操作
 * @return {Boolean} 设置结果
 */
function createSetter() {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object,
  ) {
    const result = Reflect.set(target, key, value, receiver)

    // 设置触发操作
    trigger(target, key, value)
    return result
  }
}

/**
 * @description: 拦截 Handler
 * @return {Object}
 */
export const mutableHandlers: ProxyHandler<object> = {
  get: createGetter(),
  set: createSetter(),
}
