export default class HistoryStack {
  constructor() {
    this.historyStackMap = [];
  }
  push(vm, index) {
    // const cur = stackPointer();
    const stack = this.historyStackMap[index];
    if (Array.isArray(stack)) {
      !stack.includes(vm) && stack.push(vm);
      this.historyStackMap[index] = stack.filter((item) => !item._isDestroyed);
    } else {
      const vms = [];
      vms.push(vm);
      this.historyStackMap[index] = vms;
    }
  }
  pop(vmCurrent) {
    const last = this.historyStackMap.pop();
    Array.isArray(last) &&
      last.forEach(
        (vm) => vm && vm.$keepAliveDestroy && vm.$keepAliveDestroy(vmCurrent)
      );
  }
  removeGreater(index) {
    while (this.historyStackMap.length >= index) {
      this.pop();
    }
  }
  clear() {
    this.historyStackMap = [];
  }
}
