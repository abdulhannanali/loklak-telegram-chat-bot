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
  const loklakSearch = require('./loklakSearch')(bot, redisClient, loklakRedis, loklak)

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



  bot.onText(/\/?search(.*)/, function (msg, match) {
    if (!loklakSearch.validateSearch(msg, match)) {
      loklakRedis.setSession(msg, "/search")
        .then(function (result) {
          bot.sendMessage(msg.chat.id, "You may enter the search term now! :)")
        })
        .catch(function (error) {
          console.error(error)
          errorMessage(error, msg)
        })
    }
  })

  bot.onText(/\/?browse\s*([next|previous]*)\s*[➡️]*\s*/, function (msg, match) {
    if (match[1] == "next") {
      loklakSearch.nextTweet(msg)
        .then(function (tweet) {
          if (!tweet) {
            bot.sendMessage(msg.chat.id, `Sorry! No more tweets to browse. Type /help for information on how to retrieve tweets to browse`, {
              reply_markup: {
                keyboard: [['/help']],
                one_time_keyboard: true,
                resize_keyboard: true
              }
            })
          }
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
  // if not valid input then session should be maintained
  bot.onText(/\/?user(.*)/, function (msg, match) {
    if (!loklakUser.validateUser(msg, match)) {
      loklakRedis.setSession(msg, "/user")
        .then((result) => {
            bot.sendMessage(msg.chat.id, `Please enter the twitter 🐦 username of the user 👱 you want to know about`, {})
        })
        .catch((error) => {
          errorMessage(error, msg)
        })
    }
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
  bot.on('text', function (msg) {
    // check if the input is not valid
    if (!validateInput(msg)) {
      // check for a session if input is not valid
      loklakRedis.getSession(msg)
        .then((result) => {
          loklakRedis.deleteSession(msg)
            .then(function (result) {
              console.log(`session consumed. result = ${result}`)
            })
          if (!result) {
            bot.sendMessage(msg.chat.id, "Sorry! No command found . Type /help for more information about the commands")
          }
          else if (result.trim() == "/user") {
            loklakUser.sendUserInfo(msg, msg.text.trim())
          }
          else if (result.trim() == "/search") {
            loklakSearch.validateSearch(msg, msg.text.trim())
          }
        })
    }
  })

  // validates and checks if the input matches one of the commands
  // if it matches returns true
  function validateInput(msg) {
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

    return found
  }

}
