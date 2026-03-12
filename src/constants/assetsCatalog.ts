export type AssetCatalogItem = {
  id: string;
  symbol: string;
  name: string;
  type: "crypto" | "stock" | "cash";
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
    id: "euro",
    symbol: "EUR",
    name: "Euro Cash",
    type: "cash",
    price: 1,
    currency: "EUR",
  },
];
