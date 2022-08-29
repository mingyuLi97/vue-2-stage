import babel from "rollup-plugin-babel";

export default {
  input: "./src/index.js",
  output: {
    file: "./dist/vue.js",
    // global 上挂载 Vue 的变量
    name: "Vue",
    format: "umd", // esm  commonjs iife umd
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: "node_modules/**",
    }),
  ],
};
