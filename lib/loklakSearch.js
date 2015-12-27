/*
 * loklakSearch.js
 * module for integrating the search api with loklakSearch
 * Authors: [Hannan Ali (abdulhannanali@outlook.com)]
 */

const Promise = require('promise')
const cheerio = require('cheerio')

module.exports = function (bot, redisClient, loklakRedis, loklak) {

  // validate the search regex
  function validateSearch(msg, match) {
    var searchTerm = match[1]
    if (searchTerm || searchTerm.trim()) {
      searchTerm = searchTerm.trim()
      return sendSearchResults(msg, searchTerm)
    }
    else {
      return undefined
    }
  }

  /* sends the result for the search term given
   * @param searchTerm
   * return a loklak api promise or nothing in case the search term is
   * not given
   */
  function sendSearchResults(msg, searchTerm) {
    return loklak.getTweets(searchTerm)
      .then(function (tweets) {
        if (tweets) {
          // send the first tweet as message
          sendTweet(msg, tweetMessageFormatter(tweets.pop()), true, 0, tweets.length + 1)
          // push the other tweets to the redis database
          pushTweets(msg, tweets)
        }
        else {
          notFoundMessage(msg, searchTerm)
        }
      })
      .catch(function (error) {
        errorMessage(msg, error)
      })
  }


  // sends a tweet to the user with a rebly keyboard
  // @param tweet - loklak tweet object
  // returns a promise
  function sendTweet(msg, tweet, replyKeyboard=true) {
    return new Promise(function (resolve, reject) {
      var options = {}
      if (replyKeyboard) {
        var reply_markup = {
          keyboard: [['/browse next ➡️']],
          resize_keyboard: true
        }

        options.reply_markup = reply_markup
      }
      bot.sendMessage(msg.chat.id, tweet, options)
    })
  }



  /*
   * logs error and sends message to user about error
   * @param msg - telegram msg
   * @param error - error
   */
  function errorMessage(msg, error) {
    console.error(error)
    return bot.sendMessage(msg.chat.id, "Sorry! The tweet bird 🐦 got 🐛 bugged during the search of your tweets 😠", {
      reply_to_message_id: msg.message_id
    })
  }

  /*
   * sends a not found message to user
   * @param msg - telegram msg
   * @param searchTerm - searchTerm entered
   */
  function notFoundMessage(msg, searchTerm) {
    console.log("No tweets found for " + searchTerm)
    return bot.sendMessage(msg.chat.id, "Sorry! The tweet bird 🐦 could not 🔍 find any tweets for search term you entered", {
      reply_to_message_id: msg.message_id
    })
  }

  // takes in a tweet object as formatted by loklak and returns
  // useful output sent as a message
  function tweetMessageFormatter(tweet, current=0, count=current) {
    var text= emojiAssigner(tweet.text)
    tweetText = `${text} \nby @${tweet.user.screen_name} \nlink: ${tweet.link}`
    // tweetText = `${current} of ${count}\n${tweetText}`
    return tweetText
  }

  /*
   * replaces the image tags in text with corresponding emojis
   * by stripping the alt tag
   */
  function emojiAssigner(text) {
    var $ = cheerio.load(`<div>${text}</div>`)
    $('div').children("img").each(function (idx, obj) {
      var alt = $(obj).attr("alt")
      $(obj).replaceWith(alt)
    })
    return $('div').text()
  }

  /*
   * push the tweets to the list
   * msg - msg object
   * tweets - array contain the tweet objects
   */
  function pushTweets (msg, tweets) {
    var formattedTweets = tweets.map(function (tweet) {
      return tweetMessageFormatter(tweet)
    })
    if (tweets) {
      loklakRedis.pushTweets(msg, formattedTweets)
        .then((result) => {
          console.log("tweets pushed " + result)
          })
    }
  }


  /*
   * for browsing the next tweet
   * @param msg - the telegram msg object
   * returns undefined
   */
  function nextTweet(msg) {
    return new Promise(function (resolve, reject) {
      loklakRedis.popTweet(msg.from)
        .then(function (tweet) {
          if (tweet) {
            sendTweet(msg, tweet, true, tweet.count)
            resolve(tweet)
          }
          else {
            resolve()
          }
        })
        .catch(function (error) {
          reject(error)
        })
    })
  }


  return {
    validateSearch: validateSearch,
    nextTweet: nextTweet
  }
}
