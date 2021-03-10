/* rollup.config.js */
import { version } from './package.json';
import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',  // 入口文件
  output: {
    name: 'createHelper', // umd 模式必须要有 name  此属性作为全局变量访问打包结果
    file: `dist/index.js`,
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    babel({
      extensions: [".js", ".ts"],
      exclude: "node_modules/**",
      babelHelpers: 'bundled'
    }),
    terser(),
  ],
};