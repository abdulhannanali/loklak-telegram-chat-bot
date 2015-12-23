// loklak.js api using request module
// Author : [Hannan Ali (ali.abdulhannnan@gmail.com)]
// node flags required to run this file --harmony_default_parameters
const Promise = require('promise')

const request = require('request')
const LOKLAK_SEARCH_URL = 'http://loklak.org/api/search.json'
const LOKLAK_USER_URL = 'http://loklak.org/api/user.json'

module.exports = function () {

  // makes a get request to get the tweets
  // resolves to give unparsed response
  // returns a promise
  function getTweets(query) {
    return new Promise(function (resolve, reject) {
      request({
        method: 'GET',
        uri : LOKLAK_SEARCH_URL,
        qs: optionsBuilder(query, true, 30)
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

  // returns a random single tweet regarding the query
  // takes in a param and random
  // if random is true the tweet will be selected randomly
  // otherwise the index param will be looked
  function getSingleTweet(query, random=true, index) {
    return new Promise(function (resolve, reject) {
      getTweets(query)
        .then(function (response) {
          var parsedResponse = JSON.parse(response)
          if (parsedResponse && parsedResponse.statuses) {
            // in case of random status
            if (random) {
              var randomIndex = Math.floor(Math.random() * parsedResponse.statuses.length)
              resolve(parsedResponse.statuses[randomIndex])
            }
            // in order to obtain the specific index
            else if (index && parsedResponse.statuses.length < index) {
              resolve(parsedResponse[index])
            }
            else {
              // if the random is false and there is no index resolve with index 0 status
              resolve(parsedResponse[0])
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


  // gets the user info using the loklak user api
  function getUserInfo(screen_name) {
    return new Promise(function (resolve, reject) {
      // request to the user api
      request({
        type: 'GET',
        uri: LOKLAK_USER_URL,
        qs: {
          screen_name: screen_name
        }
      }, function (error, response, body) {
        if (error) {
          reject(error)
        }
        else {
          resolve(JSON.parse(body))
        }
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
    getTweet: getSingleTweet,
    getUserInfo: getUserInfo
  }
}
