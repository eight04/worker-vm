{
  self.addEventListener("message", (e_) => {
    const e = e_ as MessageEvent;
    const code = e.data.code;
    let result: any;
    try {
      result = (0, eval)(code);
      if (result?.then) {
        result
          .then((r: any) => {
            // @ts-ignore
            self.postMessage({
              id: e.data.id,
              result: r
            });
          })
          .catch((err: any) => {
            // @ts-ignore
            self.postMessage({
              id: e.data.id,
              error: String(err)
            });
          });
        return;
      }
      // @ts-ignore
      self.postMessage({
        id: e.data.id,
        result
      });
    } catch (err) {
      // @ts-ignore
      self.postMessage({
        id: e.data.id,
        error: String(err)
      });
      return;
    }
  });
}
