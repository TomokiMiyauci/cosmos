await Deno.bundle({
  entrypoints: ["./client.tsx"],
  write: true,
  format: "esm",
  platform: "browser",
  minify: false,
  outputDir: "dist",
});

console.info("build ended");
