export const integrationOperatorDiscriminators = [
  'oanda_feed',
  'yahoo_finance_feed',
  'coingecko_feed',
]
export const INTERMEDIATE_ASSET_SYMBOL = 'USD'
export const financeAccountEcosystemTypes = [
  {
    label: '傳統金融',
    value: 'TRAD_FI',
  },
]

export const financeInstrumentTypes = [
  {
    label: '股票',
    value: 'EQUITY',
  },
  {
    label: '外匯',
    value: 'FX',
  },
  {
    label: '期貨',
    value: 'FUTURE',
  },
  {
    label: '衍生品',
    value: 'DERIVATIVE',
  },
  {
    label: '收益',
    value: 'EARNING',
  },
] as const

export const financeInstrumentAssetReferenceFields = [
  {
    name: 'base_asset_reference',
    label: '基礎資產',
    requiredByInstrumentTypes: ['FX'],
  },
  {
    name: 'quote_asset_reference',
    label: '報價資產',
    requiredByInstrumentTypes: ['FX', 'FUTURE', 'DERIVATIVE'],
  },
  {
    name: 'settlement_asset_reference',
    label: '結算資產',
    requiredByInstrumentTypes: ['FUTURE', 'DERIVATIVE'],
  },
  {
    name: 'underlying_asset_reference',
    label: '標的資產',
    requiredByInstrumentTypes: ['FUTURE', 'DERIVATIVE'],
  },
  {
    name: 'staking_asset_reference',
    label: '質押資產',
    requiredByInstrumentTypes: ['EARNING'],
  },
  {
    name: 'yielding_asset_reference',
    label: '收益資產',
    requiredByInstrumentTypes: ['EARNING'],
  },
] as const

export const colors10 = [
  '#2caffe',
  '#544fc5',
  '#00e272',
  '#fe6a35',
  '#6b8abc',
  '#d568fb',
  '#2ee0ca',
  '#fa4b42',
  '#feb56a',
  '#91e8e1',
] as const

// https://stackoverflow.com/a/34163778
export const colors20 = [
  '#1F77B4',
  '#AEC7E8',
  '#FF7F0E',
  '#FFBB78',
  '#2CA02C',
  '#98DF8A',
  '#D62728',
  '#FF9896',
  '#9467BD',
  '#C5B0D5',
  '#8C564B',
  '#C49C94',
  '#E377C2',
  '#F7B6D2',
  '#7F7F7F',
  '#C7C7C7',
  '#BCBD22',
  '#DBDB8D',
  '#17BECF',
  '#9EDAE5',
] as const
