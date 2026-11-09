import { action, computed, makeObservable, observable } from 'mobx'
import { injectable } from 'inversify'

enum State {
  Empty,
  Integer,
  Fraction,
}

export enum Alphabet {
  Delete = 'delete',
  Dot = '.',
  Zero = '0',
  One = '1',
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
}

export interface IAmountFSM {
  readonly value: number

  input(value: Alphabet): void
  clean(): void
  setPrecision(value: number): void
  setValue(value: number): void
}

export const AmountFSMSymbol = Symbol.for('IAmountFSM')

@injectable()
export class AmountFSM implements IAmountFSM {
  @observable private _precision: number = 2
  @observable private _integer: string = ''
  @observable private _fraction: string = ''
  @observable private _state: State = State.Empty

  @computed get value() {
    const f = this._fraction.padEnd(2, '0')
    switch (this._state) {
      case State.Empty:
        return parseFloat(`0.${f}`)
      default:
        return parseFloat(`${this._integer ?? 0}.${f}`)
    }
  }

  constructor() {
    makeObservable(this)
  }

  @action input(value: Alphabet) {
    switch (this._state) {
      case State.Empty:
        return this.handleEmptyState(value)
      case State.Integer:
        return this.handleIntegerState(value)
      case State.Fraction:
        return this.handleFractionState(value)
    }
  }

  @action clean() {
    this._integer = ''
    this._fraction = ''
    this._state = State.Empty
  }

  @action setPrecision(value: number) {
    this._precision = value
  }

  @action setValue(value: number): void {
    this.clean()

    for (const char of `${value}`) {
      this.input(char as Alphabet)
    }
  }

  private handleEmptyState(value: Alphabet) {
    if (this.isIntBetween(value, 1, 9)) {
      this._state = State.Integer
      this._integer = `${this._integer}${value}`
    } else if (value === Alphabet.Dot) {
      this._state = State.Fraction
    }
  }

  private handleIntegerState(value: Alphabet) {
    if (value === Alphabet.Delete) {
      if (this._integer.length === 1) {
        this._integer = ''
        this._state = State.Empty
      } else {
        this._integer = this._integer.slice(0, -1)
        this._state = State.Integer
      }
    } else if (value === Alphabet.Dot) {
      this._state = State.Fraction
    } else if (this.isDigit(value)) {
      this._integer = `${this._integer}${value}`
      this._state = State.Integer
    }
  }

  private handleFractionState(value: Alphabet) {
    if (value === Alphabet.Delete) {
      if (this._fraction.length === 0) {
        this._state = State.Integer
      } else {
        this._fraction = this._fraction.slice(0, -1)
        this._state = State.Fraction
      }
    } else if (this.isDigit(value)) {
      if (this._fraction.length < this._precision) {
        this._fraction = `${this._fraction}${value}`
        this._state = State.Fraction
      }
    }
  }

  private isDigit(digit: string) {
    const numb = parseInt(digit, 10)
    if (!Number.isNaN(numb)) {
      const value = Number(digit)

      return value >= 0 && value <= 9
    } else {
      return false
    }
  }

  private isIntBetween(value: string, min: number, max: number) {
    const numb = parseInt(value, 10)
    if (!Number.isNaN(numb)) {
      const x = Number(value)
      return x >= min && x <= max
    } else {
      return false
    }
  }
}
