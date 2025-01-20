/// <reference types="./lib.deno.d.ts" />

import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
  // @ts-ignore
} from "https://deno.land/std@0.202.0/assert/mod.ts";
import { VM } from "./mod.ts";

export const withVM = (
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

Deno.test(
  "VM.run",
  withVM(async (vm) => {
    const result = await vm.run("1 + 1");
    assertEquals(result, 2);
  })
);

Deno.test(
  "VM.run throw",
  withVM(async (vm) => {
    const err = await assertRejects(() => vm.run("throw new Error('test')"));
    assertStringIncludes(String(err), "test");
  })
);

Deno.test(
  "VM.run reject",
  withVM(async (vm) => {
    const err = await assertRejects(() =>
      vm.run("new Promise((_, reject) => reject(new Error('test')))")
    );
    assertStringIncludes(String(err), "test");
  })
);

Deno.test(
  "VM.call",
  withVM(async (vm) => {
    await vm.run(`function sum(a, b) {return a + b}`);
    const result = await vm.call("sum", 1, 1);
    assertEquals(result, 2);
  })
);

Deno.test(
  "VM.close",
  withVM(async (vm) => {
    vm.close();
    const err = await assertRejects(() => vm.run("1 + 1"));
    assertStringIncludes(String(err), "VM is closed");
  })
);

Deno.test(
  "VM.close after call",
  withVM(async (vm) => {
    const pendingErr = assertRejects(() => vm.run("1 + 1"));
    vm.close();
    const err = await pendingErr;
    assertStringIncludes(String(err), "VM is closed");
  })
);

Deno.test(
  "timeout",
  withVM(
    async (vm) => {
      const err = await assertRejects(() => vm.run("self.close()"));
      assertStringIncludes(String(err), "Timeout");
    },
    { timeoutMs: 1000 }
  )
);

Deno.test(
  "console",
  withVM(async (vm: VM) => {
    let e;
    vm.addEventListener("console", (_e) => {
      e = _e;
    });
    await vm.run("console.log('test')");
    assertEquals(e!.detail.type, "console");
    assertEquals(e!.detail.method, "log");
    assertEquals(e!.detail.args, ["test"]);
  })
);

Deno.test(
  "Deno.open",
  withVM(async (vm) => {
    const err = await assertRejects(() => vm.run("Deno.open('test')"));
    assertStringIncludes(
      String(err),
      'NotCapable: Requires read access to "test", run again with the --allow-read flag'
    );
  })
);
