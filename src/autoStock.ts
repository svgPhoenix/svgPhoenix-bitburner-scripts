import { NS } from '@ns';
// TODO sell stock to increast liquidity when below requested level
// IDEA calculate gains made from stock market

// decimal percentage of total assets to keep as cash on hand
const assetLiquidityPercent = 0.34,
  assetFixedPercent = 1 - assetLiquidityPercent,
  forecastThresholdLongBuy = 0.57,
  forecastThresholdLongSell = 0.5001,
  refreshTime = 3600, // stock market updates every 6 seconds
  commission = 1e5; // 100k

export async function main(ns: NS) {
  if (!ns.stock.has4SDataTIXAPI()) {
    ns.alert('AutoStock error: do not have access to the 4S Data API.');
    return;
  }
  if (ns.getRunningScript()!.server != 'stockMarket') {
    ns.alert('autoStock.js was run outside of the stockMarket server.');
    return;
  }
  ns.write('crawlerIgnore.txt');
  ns.disableLog('sleep');
  ns.disableLog('asleep');
  ns.disableLog('stock.buyStock');
  ns.disableLog('stock.sellStock');
  ns.clearLog();
  ns.tail();
  await ns.asleep(0);
  ns.setTitle('STONKS');
  ns.resizeTail(180, 435);
  //ns.moveTail(1680, 1);

  const symbols = ns.stock.getSymbols();
  let assetsFixed = 0,
    assetsLiquid = ns.getPlayer().money,
    assetsTotal = 0;

  while (true) {
    // calculate the player's net worth so that we can enforce their desired liquidity percentage
    assetsFixed = 0;
    assetsLiquid = ns.getPlayer().money;
    for (const symbol of symbols) {
      const [sharesLong, avgLongPrice, sharesShort, avgShortPrice] = ns.stock.getPosition(symbol);
      if (sharesLong > 0) assetsFixed += ns.stock.getSaleGain(symbol, sharesLong, 'Long');
      if (sharesShort > 0) assetsFixed += ns.stock.getSaleGain(symbol, sharesShort, 'Short');
    }
    assetsTotal = assetsFixed + assetsLiquid;
    printAssets();

    for (const symbol of symbols) {
      assetsTotal = assetsFixed + assetsLiquid;
      const forecast = ns.stock.getForecast(symbol),
        [sharesLong, avgLongPrice, sharesShort, avgShortPrice] = ns.stock.getPosition(symbol),
        ask = ns.stock.getAskPrice(symbol),
        bid = ns.stock.getBidPrice(symbol),
        volatility = ns.stock.getVolatility(symbol),
        assetsAvailable = assetsTotal * assetFixedPercent - assetsFixed;
      // ns.print(symbol + ' fcst: ' + forecast);

      if (forecast > forecastThresholdLongBuy && (sharesLong * ns.stock.getBidPrice(symbol)) / assetsTotal < 0.2) {
        const sharesToBuy = Math.min(
          Math.max(Math.floor(assetsAvailable / ns.stock.getAskPrice(symbol)), 0),
          ns.stock.getMaxShares(symbol) - sharesLong
        );
        if (((sharesToBuy * bid * volatility) / forecast) * 5 > commission) {
          const totalValue = ns.stock.buyStock(symbol, sharesToBuy) * sharesToBuy;
          assetsLiquid = ns.getPlayer().money;
          assetsFixed += totalValue;
          ns.print('B ' + symbol + ': ' + ns.formatNumber(sharesToBuy, 1));
        }
      }
      if (forecast < forecastThresholdLongSell && sharesLong > 0) {
        let soldPrice = 0;
        const saleGain = ns.stock.getSaleGain(symbol, sharesLong, 'Long'),
          profit = saleGain - avgLongPrice * sharesLong;
        if (profit > 0) {
          soldPrice = ns.stock.sellStock(symbol, sharesLong);
          const totalGain = soldPrice * sharesLong;
          assetsFixed -= totalGain;
          assetsLiquid = ns.getPlayer().money;
          ns.print('S ' + symbol + ': =$' + ns.formatNumber(profit, 1));
        }
      }
    }
    await ns.sleep(refreshTime);
  }

  function printAssets() {
    ns.print(
      '\nAssets: \nTotal = ' +
        ns.formatNumber(assetsTotal) +
        '\nFixed = ' +
        ns.formatNumber(assetsFixed) +
        '\nLiquid = ' +
        ns.formatNumber(assetsLiquid) +
        '\nL/T = ' +
        ns.formatPercent(assetsLiquid / assetsTotal)
    );
  }
}
// commission compensation formula
// shares * bid * volatility / forecast > commission
