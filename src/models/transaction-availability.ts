import { readable } from '@ts-awesome/model-reader'
import { addMinutes, isAfter, isBefore, parse, subDays } from 'date-fns'
import { TRANSACTION_AVAILABILITY_PARSE_FORMAT } from '../common/constrants'

export class TransactionAvailabilityInfo {
  @readable(String) after!: string
  @readable(String) showAt!: string
  @readable(Number) showHours!: number

  get prevHideAtDate() {
    return subDays(this.hideAtDate, 1)
  }

  get showAtDate() {
    const referenceDate = new Date()

    return parse(this.showAt, TRANSACTION_AVAILABILITY_PARSE_FORMAT, referenceDate)
  }

  get hideAtDate() {
    return addMinutes(this.showAtDate, this.showHours * 60)
  }

  get afterDate() {
    const referenceDate = new Date()

    return parse(this.after, TRANSACTION_AVAILABILITY_PARSE_FORMAT, referenceDate)
  }

  showMessage() {
    const now = new Date()

    return isBefore(now, this.prevHideAtDate) || (isAfter(now, this.showAtDate) && isBefore(now, this.hideAtDate))
  }
}
