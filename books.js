module.exports = {makeCall, formatBittrex, formatPoloniex}

var request = require('request');

let url1 = "https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-ETH&type=both"
let url2 = "https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_ETH"

var data = ""

function requestAsync(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(err, res, body) {
            if (err) { return reject(err); }
            return resolve(JSON.parse(body));
        });
    });
}

function makeCall(){
  Promise.all([requestAsync(url1), requestAsync(url2)])
      .then(function(allData) {
        // var poloniex = "Poloniex: " + allData[1]["bids"][0][0].toString()
        // var bittrex = "Bittrex: " + allData[0]["result"]["buy"][0]["Rate"].toString()
        // data = [poloniex, bittrex]
        lowerCaseData = JSON.stringify(data).toLowerCase()
        formattedData = formatData(JSON.parse(lowerCaseData))
        data = generateOrderBooks(formattedData)
      });
  return JSON.stringify(data)
}

function formatData(dataCollection){
  result = {}
  dataCollection.forEach(function(data, index){
    if(index === 0){Object.assign(result, formatBittrex(data))}
    if(index === 1){Object.assign(result, formatPoloniex(data))}
  })
  return result
}

function formatBittrex(data){
  return {name: "Bittrex",
          bids: data["result"]["buy"],
          asks: data["result"]["sell"]}
}

function formatPoloniex(data){
    var bids = data["bids"].map(function(bid){
      return {rate: bid[0],
              quantity: bid[1]}
    })
    var asks = data["asks"].map(function(bid){
      return {rate: bid[0],
              quantity: bid[1]}
    })
    return {name: "Poloniex",
            bids: bids,
            asks: asks}
}
