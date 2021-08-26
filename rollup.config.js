import clear from "rollup-plugin-clear";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import screeps from "rollup-plugin-screeps";
import nodePolyfills from "rollup-plugin-node-polyfills";

let cfg;
const dest = process.env.DEST;

if (!dest) {
  // eslint-disable-next-line no-console
  console.log(
    "No destination specified - code will be compiled but not uploaded"
  );
  // eslint-disable-next-line
} else if ((cfg = require("./screeps.json")[dest]) == null) {
  throw new Error("Invalid upload destination");
}

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [
    clear({ targets: ["dist"] }),
    commonjs(),
    nodePolyfills(),
    nodeResolve({ preferBuiltins: false }),
    typescript({ tsconfig: "./tsconfig.json" }),
    screeps({ config: cfg, dryRun: cfg == null }),
  ],
};
