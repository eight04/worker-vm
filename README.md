worker-vm
=========

[![test](https://github.com/eight04/worker-vm/actions/workflows/test.yml/badge.svg)](https://github.com/eight04/worker-vm/actions/workflows/test.yml)

A `vm` library built on top of Deno's worker.

Usage
------

```ts
import {VM} from "https://deno.land/x/worker-vm@0.1.0/mod.ts";

const vm = new VM(); // create a new VM Worker

console.log(await vm.run("1 + 1")); // run code in the worker

await vm.run(`
function sum(a, b) {
  return a + b;
} `); // define a function

console.log(await vm.call("sum", 2, 3)) // 5

vm.close(); // terminate the worker
```

Permissions
-----------

* `--unstable` - permission options in worker is an unstable feature.
* `--allow-read=path/to/worker.ts` - to launch the worker.

The code may terminate the worker
---------------------------------

Although Deno is able to block disk/network access, we can't prevent the code from calling `self.close()`. If this happens, the worker will be terminated. All calls to `vm.run` will timeout.

Similar projects
----------------

* [vm2](https://www.npmjs.com/package/vm2) - discontinued.
* [isolated-vm](https://github.com/laverdet/isolated-vm) - a much more powerful vm that runs in node. However, it has to be built from source when installing.

Changelog
---------

* 0.1.0 (Oct 9, 2023)

  - Initial release.
