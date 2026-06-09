import { build as esbuild } from "esbuild";
console.log("Imported esbuild successfully!");
esbuild({
  entryPoints: ["src/index.ts"],
  bundle: false,
  write: false,
}).then(() => {
  console.log("Esbuild ran successfully!");
}).catch((err) => {
  console.error("Esbuild error:", err);
});
