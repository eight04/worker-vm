import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
  // @ts-ignore
} from "https://deno.land/std@0.202.0/assert/mod.ts";
import { withVM } from "./mod_test.ts";

Deno.test({
  name: "network permission granted",
  fn: withVM(
    async (vm) => {
      const obj = await vm.run(
        `json = fetch('https://jsonplaceholder.typicode.com/todos/1').then(res => res.json())`
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
  permissions: "inherit", // jsonplaceholder.typicode.com:443
});

Deno.test({
  name: "network permission denied",
  fn: withVM(
    async (vm) => {
      const err = await assertRejects(() =>
        vm.run(`fetch('https://jsonplaceholder.typicode.com/todos/1')`)
      );
      assertStringIncludes(
        String(err),
        `NotCapable: Requires net access to "jsonplaceholder.typicode.com:443", run again with the --allow-net flag`
      );
    },
    {
      permissions: {
        net: [],
      },
    }
  ),
  permissions: "inherit", // jsonplaceholder.typicode.com:443
});
