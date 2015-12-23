/*
 * filename: loklakTelegram.js
 * using the telegram bot for loklak purposes
 * Authors: ["Hannan Ali (ali.abdulhannan@gmail.com)"]
 */

const fs = require("fs");
const loklak = require("./loklak")()

// some predefined messages in file
const startMessage = fs.readFileSync("./lib/messages/startMessage.md")
const helpMessage = fs.readFileSync("./lib/messages/helpMessage.md")

// this is the main bot communicating with telegram
// according to the text it will process the query
module.exports = function (bot) {

  bot.onText(/\/start/, function (msg, match) {
    bot.sendMessage(msg.chat.id, startMessage, {})
  })


  bot.onText(/\/help/, function (msg, match) {
    bot.sendMessage(msg.chat.id, helpMessage, {})
  })


  // implementation and deal with the search api when /search [query] comes
  // @param /search regexp
  bot.onText(/\/search(.*)/, function (msg, match) {
    console.log(match)
    if (!match[1] || match[1].trim() == "") {
      bot.sendMessage(msg.chat.id, "Sorry! Couldn't understand. Please type /search [query] for your tweets")
    }
    else {
      loklak.getTweet(match[1].trim(), 0).then(function (tweet) {
        bot.sendMessage(msg.chat.id, tweetMessageFormatter(tweet))
      }).catch(function (error) {
        errorMessage(error)
      })
    }
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
  bot.onText(/[^/search|/start|/help|/settings]/, function (msg, match) {
    bot.sendMessage(msg.chat.id, "Sorry! Your request didn't match any of our prescribed options. Please type /help for more details on how to use this bot 🐮🐮🐮")
  })
}
