2021

import { inject, injectable } from 'inversify'
import { nanoid } from 'nanoid'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'

export const WizardServiceSymbol = Symbol.for('IWizardService')

type WizardData<TReturn> = {
  promise: Promise<TReturn>

  resolve(payload: TReturn): void
  reject(err: Error): void
}

export interface IWizardService {
  start<T>(run: (id: string) => void): Promise<T>
  continue<T>(id: string, run: (id: string) => void): Promise<T>

  isResolved(id: string): boolean

  resolve<TReturn>(id: string, payload: TReturn): void
  reject(id: string, err: Error): void
}

@injectable()
export class WizardService implements IWizardService {
  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService

  private wizards = new Map<string, WizardData<unknown>>()

  start<T>(run: (id: string) => void): Promise<T> {
    const id = nanoid()

    const promise = new Promise<T>((resolve, reject) => {
      this.wizards.set(id, { promise, resolve, reject })

      run(id)
    })

    return promise
  }

  continue<T>(id: string, run: (id: string) => void): Promise<T> {
    const data = this.wizards.get(id)
    this.monitoring.assert(data, `Expected wizard to exist for ${id}`)

    if (data) {
      run(id)
      return data.promise as Promise<T>
    }
  }

  resolve<TReturn>(id: string, payload: TReturn): void {
    const handlers = this.wizards.get(id)
    this.monitoring.assert(handlers, `Expected wizard to exist for ${id}`)

    if (handlers) {
      handlers.resolve(payload)
      this.wizards.delete(id)
    }
  }

  reject(id: string, err: Error): void {
    const handlers = this.wizards.get(id)

    this.monitoring.assert(handlers, `Expected wizard to exist for ${id}`)

    if (handlers) {
      handlers.reject(err)
      this.wizards.delete(id)
    }
  }

  isResolved(id: string): boolean {
    return !this.wizards.has(id)
  }
}
