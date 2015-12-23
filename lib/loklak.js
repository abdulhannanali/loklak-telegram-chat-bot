// loklak.js api using request module
// Author : Hannan Ali (abdulhannanali@outlook.com)
// node flags required --harmony_default_parameters
const Promise = require('promise')

const request = require('request')
const LOKLAK_BASE_URL = 'http://loklak.org/api/search.json'


module.exports = function (minified=true, source='backend') {

  // makes a get request to get the tweets
  // resolves to give unparsed response
  // returns a promise
  function getTweets(query) {
    return new Promise(function (resolve, reject) {
      request({
        method: 'GET',
        uri : LOKLAK_BASE_URL,
        qs: optionsBuilder(query)
      }, function (error, response, body) {

        if (error) {
          reject(error)
        }
        else {
          resolve(body)
        }

      })
    })
  }

  // returns a random single query regarding the tweet
  function getSingleTweet(query) {
    return new Promise(function (resolve, reject) {
      getTweets(query)
        .then(function (response) {
          var parsedResponse = JSON.parse(response)
          if (parsedResponse && parsedResponse.statuses && parsedResponse.statuses[0]) {
            resolve(parsedResponse.statuses[Math.floor(Math.random() * parsedResponse.statuses.length)])
          }
          else {
            reject(new Error('response is not appropriate'))
          }
        })
        .catch(function (error) {
          reject(error)
        })
    })
  }

  function optionsBuilder(query, minified=true) {
    var options = {}
    options.q = query
    options.minified = minified
    return options
  }


  return {
    getTweets: getTweets,
    getTweet: getSingleTweet
  }
}()
