const version = "0.1.42";

log(new Deno.Command(Deno.execPath(), {
  args: ["task", "--cwd=packages/core", "build", version],
}).outputSync());

log(new Deno.Command(Deno.execPath(), {
  args: ["task", "--cwd=packages/core", "prepublish"],
}).outputSync());

log(new Deno.Command(Deno.execPath(), {
  args: ["task", "--cwd=packages/node/walker", "build", version],
}).outputSync());

log(new Deno.Command(Deno.execPath(), {
  args: ["task", "--cwd=packages/node/walker", "prepublish"],
}).outputSync());

log(new Deno.Command(Deno.execPath(), {
  args: ["task", "--cwd=packages/node/builder", "build", version],
}).outputSync());

log(new Deno.Command(Deno.execPath(), {
  args: ["task", "--cwd=packages/node/builder", "prepublish"],
}).outputSync());

log(new Deno.Command(Deno.execPath(), {
  args: ["task", "-r", "build", version],
}).outputSync());

log(new Deno.Command(Deno.execPath(), {
  args: ["task", "-r", "publish"],
}).outputSync());

function log(out: Deno.CommandOutput): void {
  out.stderr && console.error(new TextDecoder().decode(out.stderr));
  console.log(new TextDecoder().decode(out.stdout));
}
