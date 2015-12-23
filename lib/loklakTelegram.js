/*
 * filename: loklakTelegram.js
 * using the telegram bot for loklak purposes
 * Authors: ["Hannan Ali (ali.abdulhannan@gmail.com)"]
 */

var loklak = require("./loklak")()

// this is the main bot communicating with telegram
// according to the text it will process the query
module.exports = function (bot) {

  bot.onText(/\/start/, function (msg, match) {
    var startMessage = `Loklak Telegram Bridge
Bridge between telegram and wonders of loklak.org using it's API
To query the loklak server api for tweets
type /search [query]`

    bot.sendMessage(msg.chat.id, startMessage, {})
  })



  // implementation and deal with the search api when /search [query] comes
  // @param /search regexp
  bot.onText(/\/search\s(.*)/, function (msg, match) {
    loklak.getTweet(match[1], 0).then(function (tweet) {
      bot.sendMessage(msg.chat.id, tweetMessageFormatter(tweet))
    }).catch(function (error) {
      errorMessage(error)
    })
  })

  // takes in a tweet object as formatted by loklak and returns
  // useful output sent as a message
  function tweetMessageFormatter(tweet) {
    return `${tweet.text} \nby @${tweet.user.screen_name} \nlink: ${tweet.link  }`
  }

  // message to send in case of an error
  // returns a promise with done
  // @param optional error
  function errorMessage(error) {
    bot.sendMessage("Sorry! We were unable to process your query! 😠")
  }
}
