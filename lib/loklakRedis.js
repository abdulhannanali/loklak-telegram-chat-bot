/*
 * module for communication between the loklak and Redis API
 * Authors : [Hannan Ali (ali.abdulhannan@gmail.com)]
 *
 */
const Promise = require('promise')
const _ = require('lodash')

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
          console.log(result)
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

  /*
   * push tweets in a list
   * @param - msg
   * @param - tweets - a tweets list
   * @param - expires - expires the list if true
   */
  function pushTweets(msg, tweets, expires=true) {
    return new Promise(function (resolve, reject) {
      if (!_.isEmpty(tweets)) {
        redisClient.del(`user:tweets:${msg.from.id}`, function (error, result) {
          console.error(error)
          redisClient.lpush(`user:tweets:${msg.from.id}`,
            tweets.map((tweet, index, array) => {
              tweet.count = index + 1
              return JSON.stringify(tweet)
            }),
            function (error, result) {
            if (error) {
              reject(error)
            }
            else {
              if (expires) {
                expireKey(`user:tweets:${msg.from.id}`)
                  .catch(function (error) {
                    console.error(error)
                  })
              }
              console.log(result)
              resolve(result)
            }
          })
        })
      }
      else {
        reject(new Error("The tweets list is empty"))
      }
    })
  }

  function getTweetsCount(user) {
    return new Promise(function (resolve, reject) {
      if (user) {
        redisClient.llen(`user:tweets:${user.id}`, function (err, result) {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        })
      }
      else {
        reject(new Error("No User Entered"))
      }
    })
  }

  // takes in a tweet object as formatted by loklak and returns
  // useful output sent as a message
  function tweetMessageFormatter(tweet, index, length) {
    return `${index} of ${length - 1} \n${tweet.text} \nby @${tweet.user.screen_name} \nlink: ${tweet.link}`
  }

  function tweetCount(user) {
    return new Promise(function (resolve, reject) {
      redisClient.llen(`user:tweets:${user.id}`, function (error, count) {
        if (error) {
          reject(error)
        }
        else {
          resolve(count)
        }
      })
    })
  }

  /*
   * deletes all the tweets in the db by the user
   */
  function deleteTweets(user) {
    return new Promise(function (reolve, reject) {
      redisClient.delete(`user:tweets:${user.id}`, function (error, result) {
        if (error) {
          reject(error)
        }
        else {
          resolve(result)
        }
      })
    })
  }

  // set a session command for the user
  // return Promise
  // success - if query successful
  // fail - if error during processing the query or parameters not right
  function setSession(user, command, expire=false) {
    return new Promise (function (resolve, reject) {
      if (!user) {
        reject(new Error("user not found"))
      }
      else if (!command) {
        reject(new Error("command not found"))
      }
      else {
        var key = `user:session:${user.from.id}`
        redisClient.set(key, command, function (err, result) {
          if (err) {
            reject(err)
          }
          else {
            if (expire) {
              expireKey(key)
            }
            resolve(result)
          }
        })
      }
    })
  }

  // get a session command for the user
  function getSession(user) {
    return new Promise(function (resolve, reject) {
      if (!user) {
        reject(new Error("user not entered"))
      }
      else {
        var key = `user:session:${user.from.id}`
        redisClient.get(key, function (err, result) {
          if (err) {
            reject(err)
          }
          else {
            console.log(result)
            resolve(result)
          }
        })
      }
    })
  }

 /*
  * expires the key
  * @param given key to expire
  * @param duration in seconds - default to 3600 (1 hour)
  * returns a promise
  */
  function expireKey(key, duration=3600) {
    return new Promise(function (resolve, reject) {
      redisClient.expire(key, duration, function (err, result) {
        if (err) {
          console.error(err)
          reject(err)
        }
        else {
          console.log(`${key} will expire after ${duration}`)
          resolve(result)
        }
      })
    })
  }

  /*
   * deletes the session for the given user and returns a promise
   * @param msg - telegram message object
   * @return result
   */
  function deleteSession(msg) {
    return new Promise(function (resolve, reject) {
      redisClient.del(`user:session:${msg.from.id}`, function (error, result) {
        if (error) {
          reject(error)
        }
        else {
          resolve(result)
        }
      })
    })
  }

  return {
    popTweet: popTweet,
    pushTweet: pushTweet,
    pushTweets: pushTweets,
    tweetCount: tweetCount,
    expireKey: expireKey,
    deleteTweets: deleteTweets,
    setSession: setSession,
    deleteSession: deleteSession,
    getSession: getSession
  }
}
