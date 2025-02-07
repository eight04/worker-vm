/// <reference types="./lib.deno.d.ts" />

import {
  assert,
  assertEquals,
  assertRejects,
  assertStringIncludes,
} from "https://deno.land/std@0.202.0/assert/mod.ts";
import { VM } from "./mod.ts";

const withVM = (
  fn: (vm: VM) => Promise<void>,
  options?: { timeoutMs?: number; permissions?: Deno.PermissionOptions }
) => {
  return async () => {
    let vm: VM | undefined;
    try {
      vm = new VM(options);
      return await fn(vm);
    } finally {
      if (vm) {
        vm.close();
      }
    }
  };
};

const ALLOW_NET = Boolean(+Deno.env.get("ALLOW_NET"));

Deno.test({
  name: "VM.run",
  fn: withVM(async (vm) => {
    const result = await vm.run("1 + 1");
    assertEquals(result, 2);
  }),
});

Deno.test({
  name: "VM.run throw",
  fn: withVM(async (vm) => {
    const err = await assertRejects(() => vm.run("throw new Error('test')"));
    assertStringIncludes(String(err), "test");
  }),
});

Deno.test({
  name: "VM.run reject",
  fn: withVM(async (vm) => {
    const err = await assertRejects(() =>
      vm.run("new Promise((_, reject) => reject(new Error('test')))")
    );
    assertStringIncludes(String(err), "test");
  }),
});

Deno.test({
  name: "VM.call",
  fn: withVM(async (vm) => {
    await vm.run(`function sum(a, b) {return a + b}`);
    const result = await vm.call("sum", 1, 1);
    assertEquals(result, 2);
  }),
});

Deno.test({
  name: "VM.close",
  fn: withVM(async (vm) => {
    vm.close();
    const err = await assertRejects(() => vm.run("1 + 1"));
    assertStringIncludes(String(err), "VM is closed");
  }),
});

Deno.test({
  name: "VM.close after call",
  fn: withVM(async (vm) => {
    const pendingErr = assertRejects(() => vm.run("1 + 1"));
    vm.close();
    const err = await pendingErr;
    assertStringIncludes(String(err), "VM is closed");
  }),
});

Deno.test({
  name: "timeout",
  fn: withVM(
    async (vm) => {
      const err = await assertRejects(() => vm.run("self.close()"));
      assertStringIncludes(String(err), "Timeout");
    },
    { timeoutMs: 1000 }
  ),
});

Deno.test({
  name: "console",
  fn: withVM(async (vm: VM) => {
    let e;
    vm.addEventListener("console", (_e) => {
      e = _e;
    });
    await vm.run("console.log('test')");
    assertEquals(e!.detail.type, "console");
    assertEquals(e!.detail.method, "log");
    assertEquals(e!.detail.args, ["test"]);
  }),
});

Deno.test({
  name: "Deno.open",
  fn: withVM(async (vm) => {
    const err = await assertRejects(() => vm.run("Deno.open('test')"));
    assert(String(err).match(/PermissionDenied|NotCapable/));
    assertStringIncludes(
      String(err),
      'Requires read access to "test", run again with the --allow-read flag'
    );
  }),
});

Deno.test({
  name: "network access",
  fn: withVM(
    async (vm) => {
      const obj = await vm.run(
        `fetch('https://jsonplaceholder.typicode.com/todos/1').then(res => res.json())`
      );

      assertEquals(obj, {
        completed: false,
        id: 1,
        title: "delectus aut autem",
        userId: 1,
      });
    },
    {
      permissions: {
        net: ["jsonplaceholder.typicode.com:443"],
      },
    }
  ),
  ignore: !ALLOW_NET,
});

Deno.test({
  name: "no network access when permissions is not set",
  fn: withVM(async (vm) => {
    const err = await assertRejects(() =>
      vm.run(`fetch('https://jsonplaceholder.typicode.com/todos/1')`)
    );
    assert(String(err).match(/PermissionDenied|NotCapable/));
    assertStringIncludes(
      String(err),
      `Requires net access to "jsonplaceholder.typicode.com:443", run again with the --allow-net flag`
    );
  }),
  ignore: !ALLOW_NET,
});

Deno.test({
  name: "no network access",
  fn: withVM(async (vm) => {
    const err = await assertRejects(() =>
      vm.run(`fetch('https://jsonplaceholder.typicode.com/todos/1')`)
    );
    assert(String(err).match(/PermissionDenied|NotCapable/));
    assertStringIncludes(
      String(err),
      `Requires net access to "jsonplaceholder.typicode.com:443", run again with the --allow-net flag`
    );
  }),
  ignore: ALLOW_NET,
});

Deno.test({
  name: "no network access because permission can't be broader than parent",
  fn: async () => {
    const err = await assertRejects(async () => {
      new VM({
        permissions: {
          net: ["jsonplaceholder.typicode.com:443"],
        },
      });
    });
    assert(String(err).match(/PermissionDenied|NotCapable/));
    assertStringIncludes(
      String(err),
      `Can't escalate parent thread permissions`
    );
  },
  ignore: ALLOW_NET,
});
