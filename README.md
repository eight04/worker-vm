worker-vm
=========

![Github Build](https://github.com/eight04/worker-vm/workflows/.github/workflows/build.yml/badge.svg)

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

* `--unstable` - the deno permissions in worker option is unstable.
* `--allow-read=path/to/worker.ts` - to launch the worker.

The code may terminate the worker
---------------------------------

Although Deno is able to block disk/network access, we can't prevent the code from calling `self.close()`. If this happens, the worker will be terminated. All calls to `vm.run` will timeout.

Changelog
---------

* 0.1.0 (Oct 9, 2023)

  - Initial release.
