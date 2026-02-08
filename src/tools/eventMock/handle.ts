function getCondition(eventId, params) {

}

class EventMock {
  constructor() {
    this.handlers = new Map()
  }

  // 注册新分支
  register(condition, handler) {
    this.handlers.set(condition, handler)
    return this // 支持链式调用
  }

  // 移除分支
  unregister(condition) {
    this.handlers.delete(condition)
  }

  // 执行对应分支
  execute(condition, ...args) {
    const handler = this.handlers.get(condition)
    if (!handler) {
      throw new Error(`未找到条件 ${condition} 的处理器`)
    }
    return handler(...args)
  }
}

export default new EventMock()
