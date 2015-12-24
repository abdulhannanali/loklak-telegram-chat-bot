/*
 * filename: loklakTelegram.js
 * using the telegram bot for loklak purposes
 * Authors: ["Hannan Ali (ali.abdulhannan@gmail.com)"]
 */

const fs = require('fs');
const request = require('request')
const cheerio = require('cheerio')
const loklak = require('./loklak')()

// some predefined messages in file
const startMessage = fs.readFileSync("./lib/messages/startMessage.md")
const helpMessage = fs.readFileSync("./lib/messages/helpMessage.md")

// this is the main bot communicating with telegram
// according to the text it will process the query
module.exports = function (bot, redisClient) {

  bot.onText(/\/start/, function (msg, match) {
    bot.sendMessage(msg.chat.id, startMessage, {})
  })


  bot.onText(/\/help/, function (msg, match) {
    bot.sendMessage(msg.chat.id, helpMessage, {})
  })


  // implementation and deal with the search api when /search [query] comes
  // @param /search regexp
  bot.onText(/\/search(.*)/, function (msg, match) {
    if (!match[1] || match[1].trim() == "") {
      bot.sendMessage(msg.chat.id, "Sorry! Couldn't understand. Please type /search [query] for your tweets")
    }
    else {
      loklak.getTweet(match[1].trim()).then(function (tweet) {
        bot.sendMessage(msg.chat.id, tweetMessageFormatter(tweet))
      }).catch(function (error) {
        errorMessage(error)
      })
    }
  })


  // loklak user.json api integration route
  bot.onText(/\/user(.*)/, function (msg, match) {
    if (match && match[1]) {
      var screen_name = match[1].trim()
      loklak.getUserInfo(screen_name)
        .then(function (userInfo) {
          if (userInfo.user) {
            var userMessage = ` Name: ${userInfo.user.name} ${userInfo.user.verified ? '✅ (Verified Profile)' : ''}
  ${userInfo.user.location ? `Location: 🏠 ${userInfo.user.location}` : ''}
  Private: ${userInfo.user.protected ? '🔒 (protected)': '🔓 (not protected)'}
  Followers: 🙎 ${userInfo.user.followers_count}
  Likes: ❤️ ${userInfo.user.favourites_count}
  Tweets: 🐦 ${userInfo.user.statuses_count}
  Description: 📄 ${userInfo.user.description}
  Twitter profile link: 🔗 https://twitter.com/${screen_name}`

            // After sending Profile text
            // Send the profile pic
            bot.sendMessage(msg.chat.id, userMessage, {})
              .then(function () {
                bot.sendPhoto(msg.chat.id, request(userInfo.user.profile_image_url), {
                  caption: `@${screen_name} twitter profile image`
                })
              })
          }
          else {
            bot.sendMessage(msg.chat.id, `Sorry no user found with username @${screen_name} on twitter`)
          }
        })
        .catch(function (error) {
          errorMessage(error)
        })
    }
  })


  // status route
  bot.onText(/\/status(.*)/, function (msg, match) {
    // TODO
  })

  // /geocode route implementation
  bot.onText(/\/geocode(.*)/, function (msg, match) {
    // TODO
  })

  // crawler api bridge integration
  bot.onText(/\/crawler(.*)/, function (msg, match) {
    // TODO
  })

  // suggest api bridge integration
  bot.onText(/\/suggest(.*)/, function (msg, match) {
    // TODO
  })


  // takes in a tweet object as formatted by loklak and returns
  // useful output sent as a message
  function tweetMessageFormatter(tweet) {
    return `${tweet.text} \nby @${tweet.user.screen_name} \nlink: ${tweet.link}`
  }

  // message to send in case of an error
  // returns a promise with done
  // @param optional error
  function errorMessage(error) {
    bot.sendMessage("Sorry! We were unable to process your query! 😠")
  }

  // in case the input doesn't match any of the prescribed options
  bot.on('message', function (msg) {
    var definedEndpoints = [
      "/start",
      "/help",
      "/search",
      "/user"
    ]

    var firstWord = msg.text.split(" ")[0]
    var found;
    definedEndpoints.forEach((value) => {
      if (value == firstWord) {
        found = true
      }
    })

    if (!found) {
      bot.sendMessage(msg.chat.id, "Sorry! Your request didn't match any of our prescribed options. Please type /help for more details on how to use this bot 🐮🐮🐮")
    }
  })
}
