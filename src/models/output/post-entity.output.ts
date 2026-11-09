import { readable } from '@ts-awesome/model-reader'

export class PostEntityOutput {
  @readable(String) uid!: string
}
