await Deno.bundle({
  entrypoints: ["./client.tsx"],
  write: true,
  format: "esm",
  platform: "browser",
  minify: false,
  outputDir: "dist",
});

await Deno.writeTextFile(
  "./dist/manifest.json",
  JSON.stringify(
    {
      "assets": [
        {
          "media-type": "text/javascript",
          "path": "./client.js",
          "entrypoint": true,
        },
      ],
    },
    null,
    2,
  ),
);

console.info("build completed");
