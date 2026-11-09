import { readable } from '@ts-awesome/model-reader'

export class AppConfig {
  @readable(Number) buyDummyDelay!: number
  @readable(Number) sellDummyDelay!: number
}
