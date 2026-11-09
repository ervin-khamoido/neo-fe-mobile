import { OnChainToken } from '../../../models'

export const TransactionsActivityTitle = 'Transactions'

const avaxcTokenIcon = require('../../../../assets/images/crypto-coins/avaxc.icon.svg')
const tavaxcTokenIcon = require('../../../../assets/images/crypto-coins/avaxc.icon.svg')
const linkTokenIcon = require('../../../../assets/images/crypto-coins/link.icon.svg')
const usdcTokenIcon = require('../../../../assets/images/crypto-coins/usdc.icon.svg')

export const OnChainTokenIcon = {
  [OnChainToken.AVAXC]: avaxcTokenIcon,
  [OnChainToken.AVAXC_USDC]: usdcTokenIcon,

  [OnChainToken.TAVAXC]: tavaxcTokenIcon,
  [OnChainToken.TAVAXC_LINK]: linkTokenIcon,
}

export const OnChainTokenTitle = {
  [OnChainToken.AVAXC]: 'AVAXC',
  [OnChainToken.AVAXC_USDC]: 'USDC',

  [OnChainToken.TAVAXC]: 'TAVAXC',
  [OnChainToken.TAVAXC_LINK]: 'LINK',
}

const avalancheNetworkIcon = require('../../../../assets/images/crypto-coins/avaxc.icon.svg')

export const OnChainNetworkIcon = {
  [OnChainToken.AVAXC]: avalancheNetworkIcon,
  [OnChainToken.TAVAXC]: avalancheNetworkIcon,
}

export const OnChainNetworkTitle = {
  [OnChainToken.AVAXC]: 'Avalanche C-Chain',
  [OnChainToken.TAVAXC]: 'Avalanche C-Chain Testnet',
}
