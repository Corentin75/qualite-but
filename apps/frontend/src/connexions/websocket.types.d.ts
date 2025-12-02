export type RegisterActionsObj = {
  [methodName: string]: GenericFunction
}

export type GenericFunctionWithMultipleArgs = (...args: unknown[]) => void | Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericFunction = (obj?: any) => void | Promise<void>; 