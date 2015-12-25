// loklak.js api using request module
// Author : [Hannan Ali (ali.abdulhannnan@gmail.com)]
// node flags required to run this file --harmony_default_parameters
const Promise = require('promise')
const request = require('request')
const _ = require('lodash')

const LOKLAK_BASE_URL = process.env.LOKLAK_BASE_URL || 'http://loklak.org/api/'
const LOKLAK_SEARCH_URI = '/search.json'
const LOKLAK_USER_URL = '/user.json'

module.exports = function (loklakRedis) {

  // makes a get request to get the tweets
  // resolves to give unparsed response
  // returns a promise
  function requestTweets(query) {
    return new Promise(function (resolve, reject) {
      request({
        method: 'GET',
        baseUrl: LOKLAK_BASE_URL,
        uri : LOKLAK_SEARCH_URI,
        qs: optionsBuilder(query, true)
      }, function (error, response, body) {
        if (error) {
          console.error(error)
          reject(error)
        }
        else {
          try {
            var parsed = JSON.parse(body)
            resolve(parsed)
          }
          catch (error) {
            console.error(error)
            console.log("Invalid Request Response. Error while parsing the JSON!")
            reject(error)
          }
        }

      })
    })
  }

  // returns a random single tweet regarding the query
  // takes in a param and random
  // if random is true the tweet will be selected randomly
  // otherwise the index param will be looked
  function getRandomTweet(query, random=true, index) {
    return new Promise(function (resolve, reject) {
      requestTweets(query)
        .then(function (response) {
          var parsedResponse = response
          if (parsedResponse && parsedResponse.statuses) {
            // in case of random status
            if (_.isEmpty(parsedResponse.statuses)) {
              resolve([])
            }
            else if (random) {
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

  function getTweets(query) {
    return new Promise(function (resolve, reject) {
      if (query) {
        console.log('hey')
        requestTweets(query)
          .then(function (body) {
            var statuses = body.statuses
            if (statuses.length == 0 || _.isEmpty(statuses)) {
              resolve(undefined)
            }
            else if(statuses.length > 0) {
              resolve(statuses)
            }
          })
      }
      else {
        reject(new Error("no query found"))
      }
    })
  }

  // gets the user info using the loklak user api
  function getUserInfo(screen_name) {
    return new Promise(function (resolve, reject) {
      // request to the user api
      request({
        type: 'GET',
        baseUrl: LOKLAK_BASE_URL,
        uri: LOKLAK_USER_URL,
        qs: {
          screen_name: screen_name
        }
      }, function (error, response, body) {
        if (error) {
          reject(error)
        }
        else {
          try {
            var parsedBody = JSON.parse(body)
            resolve(parsedBody)
          }
          catch (error) {
            console.error(error)
            console.log("Error while parsing JSON")
            reject(error)
          }
        }
      })
    })
  }


  // returns the first tweet and pushes the rest to the redis
  // f.

  function optionsBuilder(query, minified=true, count=20) {
    var options = {}
    options.q = query
    options.minified = minified
    options.count = count
    return options
  }


  return {
    requestTweets: getTweets,
    getTweets: getTweets,
    getRandomTweet: getRandomTweet,
    // getAndPushTweets: getAndPushTweets,
    getUserInfo: getUserInfo
  }
}
