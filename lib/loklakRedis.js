/*
 * module for communication between the loklak and Redis API
 * Authors : [Hannan Ali (ali.abdulhannan@gmail.com)]
 *
 */
const Promise = require('promise')

module.exports = function (redisClient) {
  // function deleteInfo(user) {
  //   return new Promise(function (resolve, reject) {
  //     redisClient.del([`user:tweets:${user.id}`, `user:anon:`])
  //   })
  // }

  // pops a tweet from the redis database for the specified user
  function popTweet(user) {
    return new Promise(function (resolve, reject) {
      redisClient.rpop(`user:tweets:${user.id}`, function (error, result) {
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

      redisClient.lpush(`user:tweets:${user.id}`, tweet, function (error, result) {
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
    var timeExpire = 3600
  return new Promise(function (resolve, reject) {
      if (tweets || tweets[0] != undefined) {
        var tweetsText = tweets.map(function (value, index) {
          return tweetMessageFormatter(value, index, tweets.length)
        })

        redisClient.del(`user:tweets:${user.id}`, function (error, result) {
            if (!error) {
            console.log('previous contents deleted')
            redisClient.lpush(`user:tweets:${user.id}`, tweetsText, function (error, result) {
              if (error) {
                console.log(error)
                reject(error)
              }
              else {
                redisClient.expire(`user:tweets:${user.id}`, timeExpire, function (error, result) {
                  if (error) {
                    console.error(error)
                  }
                  if (!error) {
                    console.log(`contents will expire after ${timeExpire}`)
                  }
                })
                resolve(result)
              }
            })
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
  function tweetMessageFormatter(tweet, index, length) {
    return `${index} of ${length - 1} \n${tweet.text} \nby @${tweet.user.screen_name} \nlink: ${tweet.link}`
  }

  return {
    popTweet: popTweet,
    pushTweet: pushTweet,
    pushTweets: pushTweets
  }
}
