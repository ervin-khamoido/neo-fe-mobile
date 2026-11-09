import { readable } from '@ts-awesome/model-reader'

export class IssueCardInput {
  @readable(String) bvn!: string
}
