/*
 * module for communication between the loklak and Redis API
 * Authors : [Hannan Ali (ali.abdulhannan@gmail.com)]
 *
 */
const Promise = require('promise')

module.exports = function (redisClient) {
  // pops a tweet from the redis database for the specified user
  function popTweet(user) {
    return new Promise(function (resolve, reject) {
      redisClient.lpop(`user:tweets:${user.id}`, function (error, result) {
        if (error) {
          reject(error)
        }
        else {
          resolve(result)
        }
      })
    })
  }

  // pushes the tweet in the list for the user
  function pushTweet(tweet, user) {
    return new Promise(function (resolve, reject) {

      redisClient.lpush(`user:tweets:${user.id}`, tweetMessageFormatter(tweet), function (error, result) {
        if (error) {
          reject(error)
        }
        else {
          resolve(result)
        }
      })
    })
  }


  function pushTweets(tweets, user) {
    return new Promise(function (resolve, reject) {
      if (tweets || tweets[0] != undefined) {
        var textTweets = tweets.map(function (value, index, array) {
          return tweetMessageFormatter(value)
        })

        redisClient.lpush(`user:tweets:${user.id}`, textTweets, function (error, result) {
          if (error) {
            reject(error)
          }
          else {
            resolve(result)
          }
        })
      }
      else {
        reject(new Error("no tweets"))
      }
    })
  }

  // takes in a tweet object as formatted by loklak and returns
  // useful output sent as a message
  function tweetMessageFormatter(tweet) {
    return `${tweet.text} \nby @${tweet.user.screen_name} \nlink: ${tweet.link}`
  }

  return {
    popTweet: popTweet,
    pushTweet: pushTweet,
    pushTweets: pushTweets
  }
}
