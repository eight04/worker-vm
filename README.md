# worker-vm

[![test](https://github.com/eight04/worker-vm/actions/workflows/test.yml/badge.svg)](https://github.com/eight04/worker-vm/actions/workflows/test.yml)

A `vm` library built on top of Deno's worker.

## Usage

```ts
import { VM } from "https://deno.land/x/worker_vm@v0.1.1/mod.ts";

const vm = new VM({
  timeoutMs: 30 * 1000,
  permissions: "none",
}); // create a new VM Worker

console.log(await vm.run("1 + 1")); // run code in the worker

await vm.run(`
function sum(a, b) {
  return a + b;
} `); // define a function

console.log(await vm.call("sum", 2, 3)); // 5

vm.close(); // terminate the worker
```

## Default permissions

- `--unstable-worker-options` - permission options in worker is an unstable feature.
- `--allow-read=path/to/worker.ts` - to launch the worker.

## FAQ

### `NotCapable` error not found

According to Deno documentation [`Deno.errors.NotCapable`](https://docs.deno.com/api/deno/~/Deno.errors.NotCapable):

> Before Deno 2.0, this condition was covered by the PermissionDenied error.

Install `deno` version 2.0 or later should resolve the issue.

### The code may terminate the worker

Although Deno is able to block disk/network access by default, we can't prevent the code from calling `self.close()`. If this happens, the worker will be terminated. All calls to `vm.run` will timeout.

### XXX is not cloneable

Data must be cloneable to be passed to the worker:

- `VM.call` - function arguments are JSON-cloned.
- The result of `VM.run` - throws an error if it is not cloneable.
- `VM.on("console")` - function arguments are JSON-cloned.

### Requires net/read/write/... access to

Grant specific permissions to `worker-vm` by creating new VM with `permissions:` option:

```js
const vm = new VM({
  // https://docs.deno.com/api/web/~/WorkerOptions.deno#property_permissions
  permissions: // ...
});
```

## For contributors

### Testing

```sh
$ deno task test
```

### Update Deno built-in types

```sh
$ deno task types
```

## Similar projects

- [vm2](https://www.npmjs.com/package/vm2) - discontinued.
- [isolated-vm](https://github.com/laverdet/isolated-vm) - a much more powerful vm that runs in node. However, it has to be built from source when installing.

## Changelog

- next (Jan 19, 2025)

  - Add: `permissions` option.

- 0.2.0 (Oct 10, 2023)

  - Add: capture console output.

- 0.1.2 (Oct 10, 2023)

  - Update README.

- 0.1.0 (Oct 9, 2023)

  - Initial release.
