export const isDef = function (v) {
  return v !== undefined && v !== null;
};
const PLACEHOLDER_VM = {
  __placeholder: true,
};
export const resolvePushedVm = (currentVm) => {
  return (isDef(currentVm) && currentVm.$vnode.data.keepAlive) ? currentVm : PLACEHOLDER_VM;
};
export const isPlaceHolderVm = (vm) => vm && !!vm.__placeholder;

export const getStateId = function () {
  const state = getCurrentState();
  return isDef(state) ? state.id : undefined;
};

export const getQuery = function (params) {
  let query = '';
  query = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join('&');
  if (query.length > 0) {
    query = `?${query}`;
  }
  return query;
};
const getCurrentState = function () {
  return history.state;
};

export const genKey = function (num, router) {
  return `keep-alive-vnode-key${Number(num)}${router.history.current.path}`;
};
export const getCurrentVM = function (router) {
  return router.history.current.matched.length > 0
    ? router.history.current.matched[0].instances.default
    : undefined;
};
export const setCurrentVnodeKey = function (router, key) {
  const current = getCurrentVM(router);
  if (current && current._vnode) {
    current._vnode.parent.key = key;
  }
};
export const replaceFirstKeyAndCache = function (vm, key) {
  if (!isDef(vm) || !isDef(vm.cache) || !isDef(vm.keys)) {
    return;
  }
  const keys = vm.keys;
  const cache = vm.cache;
  if (keys.length === 1) {
    const vnode = cache[keys[0]];
    delete cache[keys[0]];
    keys.splice(0, 1);
    keys.push(key);
    cache[key] = vnode;
  }
};
export const getFirstComponentChild = function (children) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c;
      }
    }
  }
};


export const  getRealChild = function (vnode) {
  const compOptions = vnode && vnode.componentOptions
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

const isAsyncPlaceholder = function (node) {
  return node.isComment && node.asyncFactory;
};

export const replaceState = function (mode, router, id) {
  const { pathname, search, hash } = window.location;
  let path = `${pathname}${search}${hash}`;
  let state = isDef(history.state) ? history.state : {};
  state['id'] = id;
  // optimize file:// URL
  const isFilSys = window.location.href.startsWith('file://');
  history.replaceState(state, '', isFilSys ? null : path);
};

export const inBrowser = typeof window !== 'undefined';




export function cached (fn) {
  const cache = Object.create(null)
  return (function cachedFn (str) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  })
}

/**
 * Camelize a hyphen-delimited string.
 */
const camelizeRE = /-(\w)/g
export const camelize = cached((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
})

export function extend (to, _from) {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

export function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $flow-disable-line
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

export const getStateForward = function () {
  const state = getCurrentState();
  return isDef(state) ? state.__forward : undefined;
}

export const setStateForward = function (_path) {
  const { pathname, search, hash } = window.location;
  let path = `${pathname}${search}${hash}`;
  let state = isDef(history.state) ? history.state : {};
  state['__forward'] = _path;
  // optimize file:// URL
  const isFilSys = window.location.href.startsWith('file://');
  history.replaceState(state, '', isFilSys ? null : path);
}