import { readable } from '@ts-awesome/model-reader'
import { UserSearchOutput } from '../output/user-search.output'

export class TransferOrderInput {
  @readable(UserSearchOutput, true) receiver!: UserSearchOutput | null
  @readable(Number) amountUsdc!: number
}
