import 'vitest';

interface CustomMatchers<R = unknown> {
  toBeValidDate: () => R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
