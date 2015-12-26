/*
 * filename: loklakTelegram.js
 * using the telegram bot for loklak purposes
 * Authors: ["Hannan Ali (ali.abdulhannan@gmail.com)"]
 */

const fs = require('fs');
const request = require('request')
const cheerio = require('cheerio')
const _ = require('lodash')


// some predefined messages in file
try {
  const startMessage = JSON.parse(fs.readFileSync("./lib/messages/startMessage.json"))
  const helpMessage = JSON.parse(fs.readFileSync("./lib/messages/helpMessage.json"))
}
catch (error) {
  console.log('failed to parse one of the predefined message')
  console.error(error)
}

// this is the main bot communicating with telegram
// according to the text it will process the query
module.exports = function (bot, redisClient) {

  const loklakRedis = require('./loklakRedis')(redisClient)
  const loklak = require('./loklak')(loklakRedis)
  const loklakUser = require('./loklakUser')(bot, redisClient, loklakRedis, loklak)

  bot.onText(/\/?start/, function (msg, match) {
    bot.sendMessage(msg.chat.id, startMessage.text, {
      reply_markup: {
        keyboard: [
          ["/search", "/user"],
                ["/help"],
          ["/delete", "/anon"]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    })
  })


  bot.onText(/\/?help/, function (msg, match) {
    bot.sendMessage(msg.chat.id, helpMessage.text, {
      reply_markup: {
        keyboard: [
          ["/search", "/user"],
          ["/delete", "/anon"]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    })
  })

  // takes in a tweet object as formatted by loklak and returns
  // useful output sent as a message
  function tweetMessageFormatter(tweet) {
    var text= emojiAssigner(tweet.text)
    return `${text} \nby @${tweet.user.screen_name} \nlink: ${tweet.link}`
  }

  function emojiAssigner(text) {
    var $ = cheerio.load(`<div>${text}</div>`)
    $('div').children("img").each(function (idx, obj) {
      var alt = $(obj).attr("alt")
      $(obj).replaceWith(alt)
    })
    return $('div').text()
  }

  bot.onText(/\/?search(.*)/, function (msg, match) {
    var query = match[1].trim()
    if (query) {
      loklak.getTweets(query)
        .then(function (tweets) {
          if (tweets) {
            bot.sendMessage(msg.chat.id, tweetMessageFormatter(tweets.pop()), {
              reply_markup: replyKeyboard(false)
            })
            .then(function () {
              loklakRedis.pushTweets(tweets, msg.from)
            })
          }
          else {
            bot.sendMessage(msg.chat.id, "Sorry! No tweets found for the given query!")
          }
        })
        .catch(function (error) {
          errorMessage(error, msg)
        })
    }
    else {
      bot.sendMessage(msg.chat.id, `Hi! /search is used to search for the tweets. \nYou can 🔍 for the tweets by typing the query after /search.\nFormat: /search [query] \nExample: /search fossasia`)
    }
  })

  bot.onText(/\/?browse\s*([next|previous]*)\s*[➡️]*\s*/, function (msg, match) {
    if (match[1] == "next") {
      loklakRedis.popTweet(msg.from)
        .then(function (tweet) {
          if (tweet) {
            bot.sendMessage(msg.chat.id, emojiAssigner(tweet), {
              reply_markup: replyKeyboard(false)
            })
          }
          else {
            bot.sendMessage(msg.chat.id, "4️⃣0️⃣4️⃣! No tweet to browse. Type /help in order to know about getting the tweets to browse", {
              reply_markup: {
                one_time_keyboard: true,
                resize_keyboard:  true,
                keyboard: [['/help ➕']]
              }
            })
          }
        })
        .catch(function (error) {
          errorMessage(error, msg)
        })
    }
    else {
      loklakRedis.tweetCount(msg.from)
        .then(function (count) {
          bot.sendMessage(msg.chat.id, `Hi! You can browse among the tweets. Type /help to get more info on how to get tweets for browsing\nYou have currently ${count} tweet${count == 1 ? "": "s"} to browse`)
        })
        .catch(function (error) {
          errorMessage(error, msg)
        })
    }
  })


  // loklak user.json api integration route
  bot.onText(/\/?user(.*)/, function (msg, match) {
    loklakUser.validateUser(msg, match)
  })

  // status route
  bot.onText(/\/?status(.*)/, function (msg, match) {
    // TODO
  })

  // /geocode route implementation
  bot.onText(/\/?geocode(.*)/, function (msg, match) {
    // TODO
  })

  // crawler api bridge integration
  bot.onText(/\/?crawler(.*)/, function (msg, match) {
    // TODO
  })

  // suggest api bridge integration
  bot.onText(/\/?suggest(.*)/, function (msg, match) {
    // TODO
  })


  function replyKeyboard(one_time=true) {
    var reply_keyboard = {}
    reply_keyboard.keyboard = [['/browse next ➡️']]
    reply_keyboard.resize_keyboard = true
    if (one_time) {
      reply_keyboard.one_time_keyboard = true
    }
    return reply_keyboard
  }


  // message to send in case of an error
  // returns a promise with done
  // @param optional error
  function errorMessage(error, msg) {
    console.error(error)
    bot.sendMessage(msg.chat.id, "Sorry! We were unable to process your query! 😠")
  }

  // in case the input doesn't match any of the prescribed options
  bot.on('message', function (msg) {
    var definedEndpoints = [
      /\/?start.*/,
      /\/?help.*/,
      /\/?search.*/,
      /\/?user.*/,
      /\/?browse.*/,
      /\/?browse\s*next\s*[➡️]*\s*/,
      /\/?browse\s*back\s*[⬅️]*\s*/
    ]

    var text = msg.text
    var found;
    definedEndpoints.forEach((value) => {
      if (value.test(text)) {
        found = true
      }
    })
    if (!found) {
      bot.sendMessage(msg.chat.id, "Sorry! Your request didn't match any of our prescribed options. Please type /help for more details on how to use this bot 🐮🐮🐮")
    }
  })

}
