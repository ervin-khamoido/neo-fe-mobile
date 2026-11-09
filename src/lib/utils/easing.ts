import _ from 'lodash'

function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

// type SpaceGenerator = (from: number, to: number, n: number) => number[]

export const Space = Object.freeze({
  linSpace: (from, to, n) => _.times(n + 1, t => from + (to - from) * (t / n)),
  easeOutExpoSpace: (from, to, n) => _.times(n + 1, t => from + (to - from) * easeOutExpo(t / n)),
})
