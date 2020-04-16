export const promiseAll = async <T>(n: number, thunks: (() => Promise<T> | T)[]) => {
  if (n === 0) return Promise.all(thunks.map((thunk) => thunk()))
  const head = thunks.slice(0, n)
  const tail = thunks.slice(n)
  const result: T[] = []
  const execute = async (thunk: () => Promise<T> | T, i: number, runNext: () => Promise<void>) => {
    result[i] = await thunk()
    await runNext()
  }
  const runNext = async () => {
    const i = thunks.length - tail.length
    const promise = tail.shift()
    if (promise !== undefined) {
      await execute(promise, i, runNext)
    }
  }
  await Promise.all(head.map((thunk, i) => execute(thunk, i, runNext)))
  return result
}

export default class ArrayPromise<T> extends Promise<T[]> {
  static from = <T>(arr: T[] | Promise<T[]>) => new ArrayPromise<T>((resolve) => resolve(arr))
  public flat<P>(
    this: ArrayPromise<
      | P
      | P[]
      | P[][]
      | P[][][]
      | P[][][][]
      | P[][][][][]
      | P[][][][][][]
      | P[][][][][][][]
      | P[][][][][][][][]
      | P[][][][][][][][][]
      | P[][][][][][][][][][]
    >
  ) {
    return new ArrayPromise<P>(async (resolve) => resolve((await this).flat()))
  }
  public flatMap<P>(
    fn: (
      el: T
    ) =>
      | P
      | P[]
      | P[][]
      | P[][][]
      | P[][][][]
      | P[][][][][]
      | P[][][][][][]
      | P[][][][][][][]
      | P[][][][][][][][]
      | P[][][][][][][][][]
      | P[][][][][][][][][][]
      | Promise<
          | P
          | P[]
          | P[][]
          | P[][][]
          | P[][][][]
          | P[][][][][]
          | P[][][][][][]
          | P[][][][][][][]
          | P[][][][][][][][]
          | P[][][][][][][][][]
          | P[][][][][][][][][][]
        >,
    limit?: number
  ): ArrayPromise<P>
  public flatMap<P>(
    fn: (
      el: T,
      i: number
    ) =>
      | P
      | P[]
      | P[][]
      | P[][][]
      | P[][][][]
      | P[][][][][]
      | P[][][][][][]
      | P[][][][][][][]
      | P[][][][][][][][]
      | P[][][][][][][][][]
      | P[][][][][][][][][][]
      | Promise<
          | P
          | P[]
          | P[][]
          | P[][][]
          | P[][][][]
          | P[][][][][]
          | P[][][][][][]
          | P[][][][][][][]
          | P[][][][][][][][]
          | P[][][][][][][][][]
          | P[][][][][][][][][][]
        >,
    limit?: number
  ): ArrayPromise<P>
  public flatMap<P>(
    fn: (
      el: T,
      i: number,
      arr: T[]
    ) =>
      | P
      | P[]
      | P[][]
      | P[][][]
      | P[][][][]
      | P[][][][][]
      | P[][][][][][]
      | P[][][][][][][]
      | P[][][][][][][][]
      | P[][][][][][][][][]
      | P[][][][][][][][][][]
      | Promise<
          | P
          | P[]
          | P[][]
          | P[][][]
          | P[][][][]
          | P[][][][][]
          | P[][][][][][]
          | P[][][][][][][]
          | P[][][][][][][][]
          | P[][][][][][][][][]
          | P[][][][][][][][][][]
        >,
    limit?: number
  ): ArrayPromise<P>
  public flatMap<P>(
    fn: (
      el: T,
      i: number,
      arr: T[]
    ) =>
      | P
      | P[]
      | P[][]
      | P[][][]
      | P[][][][]
      | P[][][][][]
      | P[][][][][][]
      | P[][][][][][][]
      | P[][][][][][][][]
      | P[][][][][][][][][]
      | P[][][][][][][][][][]
      | Promise<
          | P
          | P[]
          | P[][]
          | P[][][]
          | P[][][][]
          | P[][][][][]
          | P[][][][][][]
          | P[][][][][][][]
          | P[][][][][][][][]
          | P[][][][][][][][][]
          | P[][][][][][][][][][]
        >,
    limit = 0
  ) {
    return new ArrayPromise<P>(async (resolve) =>
      resolve(
        (
          await promiseAll(
            limit,
            (await this).map((...args) => () => fn(...args))
          )
        ).flat()
      )
    )
  }
  public map<P>(fn: (el: T) => P | Promise<P>, limit?: number): ArrayPromise<P>
  public map<P>(fn: (el: T, i: number) => P | Promise<P>, limit?: number): ArrayPromise<P>
  public map<P>(fn: (el: T, i: number, arr: T[]) => P | Promise<P>, limit?: number): ArrayPromise<P>
  public map<P>(fn: (el: T, i: number, arr: T[]) => P | Promise<P>, limit = 0) {
    return new ArrayPromise<P>(async (resolve) =>
      resolve(
        await promiseAll(
          limit,
          (await this).map((...args) => () => fn(...args))
        )
      )
    )
  }
  public filter(fn: (el: T) => boolean | Promise<boolean>, limit?: number): ArrayPromise<T>
  public filter(
    fn: (el: T, i: number) => boolean | Promise<boolean>,
    limit?: number
  ): ArrayPromise<T>
  public filter(
    fn: (el: T, i: number, arr: T[]) => boolean | Promise<boolean>,
    limit?: number
  ): ArrayPromise<T>
  public filter(fn: (el: T, i: number, arr: T[]) => boolean | Promise<boolean>, limit = 0) {
    return new ArrayPromise<T>(async (resolve) => {
      const arr = await this
      const filter = await promiseAll(
        limit,
        arr.map((...args) => () => fn(...args))
      )
      resolve(arr.filter((_, i) => filter[i]))
    })
  }
  public async reduce(fn: (acc: T, el: T, i: number, arr: T[]) => T, init?: undefined): Promise<T>
  public async reduce<P>(fn: (acc: T, el: T, i: number, arr: T[]) => P, init: P): Promise<P>
  public async reduce<P>(fn: (acc: P, el: T, i: number, arr: T[]) => P, init: P): Promise<P> {
    return (await this).reduce(fn, init)
  }
  public async forEach(fn: (el: T) => unknown | Promise<unknown>, limit?: number): Promise<void>
  public async forEach(
    fn: (el: T, i: number) => unknown | Promise<unknown>,
    limit?: number
  ): Promise<void>
  public async forEach(
    fn: (el: T, i: number, arr: T[]) => unknown | Promise<unknown>,
    limit?: number
  ): Promise<void>
  public async forEach(fn: (el: T, i: number, arr: T[]) => unknown | Promise<unknown>, limit = 0) {
    await promiseAll(
      limit,
      (await this).map((...args) => () => fn(...args))
    )
  }
}
