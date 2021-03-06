module.exports = {formatData,
                  combineData,
                  formatBittrex,
                  formatPoloniex,
                  sortPrices,
                  downCase,
                  placeholderRowData,
                  askHighlighting,
                  bidHighlighting,
                  formatHitbtc,
                  formatBitstamp}

function formatData(data){
  let homogenizedData = homogenizeResponses(data)
  let bids_data = combineData(homogenizedData, "bids")
  let asks_data = combineData(homogenizedData, "asks")
  return [bids_data, asks_data]
}

function homogenizeResponses(data){
  return downCase(data).map(function(exchangeData){
    switch (exchangeData.name) {
      case 'bittrex': return formatBittrex(exchangeData)
      case 'poloniex': return formatPoloniex(exchangeData)
      case 'hitbtc': return formatHitbtc(exchangeData)
      case 'bitstamp': return formatBitstamp(exchangeData)
    }
  })
}

function formatBittrex(data){
  return {name: 'bittrex',
          bids: data['result']['buy'].slice(0, 50),
          asks: data['result']['sell'].slice(0, 50)}
}

function formatPoloniex(data){
    let bids = data['bids'].map(function(bid){
      return {rate: bid[0],
              quantity: bid[1]}
    })
    let asks = data['asks'].map(function(bid){
      return {rate: bid[0],
              quantity: bid[1]}
    })
    return {name: 'poloniex',
            bids: bids,
            asks: asks}
}

function formatBitstamp(data){
  let bids = data['bids'].map(function(bid){
    return {rate: + bid[0],
            quantity: + bid[1]}
  })
  let asks = data['asks'].map(function(ask){
    return {rate: + ask[0],
            quantity: + ask[1]}
  })
  return {name: 'bitstamp',
          bids: bids.slice(0, 50),
          asks: asks.slice(0, 50)}
}

function formatHitbtc(data){
  let bids = data['bid'].map(function(bid){
    return {rate: + bid.price,
            quantity: + bid.size}
  })
  let asks = data['ask'].map(function(bid){
    return {rate: + bid.price,
            quantity: + bid.size}
  })
  return {name: 'hitbtc',
          bids: bids,
          asks: asks}
}

function downCase(data){
  let lowerCaseData = JSON.stringify(data).toLowerCase()
  return JSON.parse(lowerCaseData)
}

function combineData(data, orderType){
  let rowData = placeholderRowData(data, orderType)
  data.forEach(function(exchange){
    exchange[orderType].forEach(function(order){
      rowData[order.rate]['volumes'][exchange.name] += order.quantity
      rowData[order.rate]['highlight'] = highlighting(order.rate, data, orderType)
    })
  })
  return rowData
}

function placeholderRowData(data, orderType){
  let placeholderData = {}
  let sortedPrices = sortPrices(data, orderType)
  sortedPrices.forEach(function(price){
    let volPlaceholder = {}
    data.forEach(function(exchange){ volPlaceholder[exchange.name] = 0 })
    placeholderData[price] = {'volumes': volPlaceholder,
                              'highlight': false}
  })
  return placeholderData
}

function sortPrices(data, orderType){
  let prices = []
  data.forEach(function(exchange){
    exchange[orderType].forEach(function(order){
      prices.push(order.rate)
    })
  })
  if(orderType === 'bids'){return prices.sort().reverse()}
  if(orderType === 'asks'){return prices.sort()}
}

function highlighting(price, data, orderType){
  if(orderType === 'asks'){return askHighlighting(price, data)}
  if(orderType === 'bids'){return bidHighlighting(price, data)}
}

function askHighlighting(price, data){
  let maxBid = sortPrices(data, 'bids')[0]
  if (price <= maxBid){return 'bg-warning'}
}

function bidHighlighting(price, data){
  let minAsk = sortPrices(data, 'asks')[0]
  if (price >= minAsk){return 'bg-warning'}
}
