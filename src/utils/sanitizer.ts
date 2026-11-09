import { inject, injectable } from 'inversify'

export interface ICleanable {
  clean(): void
}

export function cleanable<T extends { new (...rest: any[]): ICleanable }>(Class: T) {
  @injectable()
  class CleanWrapper extends Class {
    @inject(SanitizerSymbol) sanitizer: ISanitizer

    constructor(...rest: any[]) {
      super(...rest)

      setImmediate(() => {
        this.sanitizer.register(this)
      })
    }
  }

  return CleanWrapper
}

export interface ISanitizer {
  cleanup(): void
  register(obj: ICleanable): void
}

export const SanitizerSymbol = Symbol.for('ISanitizer')

@injectable()
export class Sanitizer implements ISanitizer {
  private _cleanables: ICleanable[] = []

  async cleanup(): Promise<void> {
    this._cleanables.forEach(x => {
      x.clean()
    })
  }

  register(obj: ICleanable): void {
    if (!this._cleanables.includes(obj)) {
      this._cleanables.push(obj)
    }
  }
}
