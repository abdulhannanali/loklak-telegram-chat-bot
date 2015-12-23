// loklak.js api using request module
// Author : [Hannan Ali (ali.abdulhannnan@gmail.com)]
// node flags required to run this file --harmony_default_parameters
const Promise = require('promise')

const request = require('request')
const LOKLAK_BASE_URL = 'http://loklak.org/api/search.json'


module.exports = function () {

  // makes a get request to get the tweets
  // resolves to give unparsed response
  // returns a promise
  function getTweets(query) {
    return new Promise(function (resolve, reject) {
      request({
        method: 'GET',
        uri : LOKLAK_BASE_URL,
        qs: optionsBuilder(query, true, 10)
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
  function getSingleTweet(query, index) {
    return new Promise(function (resolve, reject) {
      getTweets(query)
        .then(function (response) {
          var parsedResponse = JSON.parse(response)
          if (parsedResponse && parsedResponse.statuses) {
            if (index < parsedResponse.statuses.length) {
              resolve(parsedResponse.statuses[index])
            }
            else {
              reject(new Error("index not found"))
            }
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

  function optionsBuilder(query, minified=true, count=20) {
    var options = {}
    options.q = query
    options.minified = minified
    options.count = count
    return options
  }


  return {
    getTweets: getTweets,
    getTweet: getSingleTweet
  }
}
