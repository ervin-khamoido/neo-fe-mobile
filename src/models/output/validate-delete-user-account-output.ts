import { readable } from '@ts-awesome/model-reader'

export enum CustomErrorType {
  Validation = 'validation',
}

export class CustomErrorOutput {
  @readable(String) type!: CustomErrorType
  @readable(String) code!: string
  @readable(String) message!: string
}

export class ValidateDeleteUserAccountOutput {
  @readable(Boolean) valid!: boolean
  @readable([CustomErrorOutput], true) errors?: CustomErrorOutput[] | null
}
