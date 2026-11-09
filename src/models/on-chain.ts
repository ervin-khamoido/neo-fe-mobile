import { readable } from '@ts-awesome/model-reader'
import { IOnChainFeeResult } from './activity'
export class VerifyCryptoAddressOutput {
  @readable(Boolean) isAddressValid!: boolean
  @readable(String, true) addressValidationError?: string
  @readable(Boolean) addressBelongsToNeobank!: boolean
}

export class VerifyCryptoAddressBody {
  @readable(String) address!: string
  @readable(String) baseCoin!: string
  @readable(String) coin!: string
}

export class CalculateOnChainOrderInput {
  @readable(Number) amountUsdc!: number
  @readable(String) baseCoin!: string
  @readable(String) coin!: string
  @readable(String) toAddress!: string
}

export class CalculatedOnChainOrderOutput {
  @readable(String) txRef!: string
  @readable(String) coin!: string
  @readable(String) baseCoin!: string
  @readable(String) toAddress!: string
  @readable(Number) exchangeRate!: number
  @readable(Number) amountUsdc!: number
  @readable(Object) fees!: IOnChainFeeResult
  @readable(Number) totalUsdc!: number
}

export class OnChainOrderInput {
  @readable(String) txRef!: string
}

export enum CryptoToken {
  USDC = 'usdc',
}

export enum CryptoNetwork {
  AvalancheCChain = 'avaxc',
}

export interface ITokenOption {
  icon: any
  label: string
  value: CryptoToken
}

export interface INetworkOption {
  icon: any
  label: string
  value: CryptoNetwork
}
