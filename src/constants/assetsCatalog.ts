export type AssetCatalogItem = {
  id: string;
  symbol: string;
  name: string;
  type: "crypto" | "stock" | "etf" | "staking" | "cash";
  price: number;
  currency: "EUR";
};

export const assetsCatalog: AssetCatalogItem[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    type: "crypto",
    price: 62000,
    currency: "EUR",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    type: "crypto",
    price: 3200,
    currency: "EUR",
  },
  {
    id: "tether",
    symbol: "USDT",
    name: "Tether",
    type: "crypto",
    price: 0.92,
    currency: "EUR",
  },

  {
    id: "usdt-staking",
    symbol: "USDT",
    name: "Tether Staking",
    type: "staking",
    price: 0.92,
    currency: "EUR",
  },
  {
    id: "eth-staking",
    symbol: "ETH",
    name: "Ethereum Staking",
    type: "staking",
    price: 3200,
    currency: "EUR",
  },

  {
    id: "apple",
    symbol: "AAPL",
    name: "Apple",
    type: "stock",
    price: 205,
    currency: "EUR",
  },
  {
    id: "tesla",
    symbol: "TSLA",
    name: "Tesla",
    type: "stock",
    price: 170,
    currency: "EUR",
  },
  {
    id: "nvidia",
    symbol: "NVDA",
    name: "NVIDIA",
    type: "stock",
    price: 820,
    currency: "EUR",
  },
  {
    id: "microsoft",
    symbol: "MSFT",
    name: "Microsoft",
    type: "stock",
    price: 390,
    currency: "EUR",
  },

  {
    id: "vwce",
    symbol: "VWCE",
    name: "Vanguard FTSE All-World UCITS ETF",
    type: "etf",
    price: 121,
    currency: "EUR",
  },
  {
    id: "sxr8",
    symbol: "SXR8",
    name: "iShares Core S&P 500 UCITS ETF",
    type: "etf",
    price: 512,
    currency: "EUR",
  },
  {
    id: "eunl",
    symbol: "EUNL",
    name: "iShares Core MSCI World UCITS ETF",
    type: "etf",
    price: 91,
    currency: "EUR",
  },

  {
    id: "euro",
    symbol: "EUR",
    name: "Euro Cash",
    type: "cash",
    price: 1,
    currency: "EUR",
  },
];
