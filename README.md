# worker-vm

[![test](https://github.com/eight04/worker-vm/actions/workflows/test.yml/badge.svg)](https://github.com/eight04/worker-vm/actions/workflows/test.yml)

A `vm` library built on top of Deno's worker.

## Usage

```ts
import { VM } from "https://deno.land/x/worker_vm@v0.1.1/mod.ts";

const vm = new VM({
  timeoutMs: 30 * 1000,
  permissionOptions: "none" // { "net": ["example.com:443"], "read": ["foo.txt", "bar.txt"]}
}); // create a new VM Worker

console.log(await vm.run("1 + 1")); // run code in the worker

await vm.run(`
function sum(a, b) {
  return a + b;
} `); // define a function

console.log(await vm.call("sum", 2, 3)); // 5

vm.close(); // terminate the worker
```

## Permissions

### Default

- `--unstable` - permission options in worker is an unstable feature.
- `--allow-read=path/to/worker.ts` - to launch the worker.

### Custom

- `--allow-[read,write,net,env,sys,run,ffi,import]=...` - user can specify different permissions via `permissionOptions` to adapt to their use cases.

## FAQ

### The code may terminate the worker

Although Deno is able to block disk/network access by default, we can't prevent the code from calling `self.close()`. If this happens, the worker will be terminated. All calls to `vm.run` will timeout.

### XXX is not cloneable

Data must be cloneable to be passed to the worker:

- `VM.call` - function arguments are JSON-cloned.
- The result of `VM.run` - throws an error if it is not cloneable.
- `VM.on("console")` - function arguments are JSON-cloned.

### Requires net access to "example.com:443", run again with the --allow-net flag

`worker-vm` is secure by default due to its restrictive initial permissions. To make network operations, please specify `permissionOptions` when creating new `VM()`.

## Similar projects

- [vm2](https://www.npmjs.com/package/vm2) - discontinued.
- [isolated-vm](https://github.com/laverdet/isolated-vm) - a much more powerful vm that runs in node. However, it has to be built from source when installing.

## Changelog

- 0.3.0 (Jan 18, 2025)

  - Add: optional permissions.

- 0.2.0 (Oct 10, 2023)

  - Add: capture console output.

- 0.1.2 (Oct 10, 2023)

  - Update reamde.

- 0.1.0 (Oct 9, 2023)

  - Initial release.
