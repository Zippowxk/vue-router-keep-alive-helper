import Helper from './helper';
import { extendVue, extendHistory } from './extension';
import { inBrowser } from './utils';

let singleton;
// TODO: 1. abstract mode support
export default function createHelper(config) {
  if (config.Vue === undefined || config.router === undefined) {
    console.warn(
      'warning: router helper needs Vue and root router ,see more for guide : https://github.com/Zippowxk/vue-router-keep-alive-helper'
    );
    return;
  }
  if (singleton) {
    return singleton;
  }
  if (inBrowser) {
    extendHistory(window.history);
  }
  extendVue(config.Vue);
  return (singleton = new Helper(config));
}
