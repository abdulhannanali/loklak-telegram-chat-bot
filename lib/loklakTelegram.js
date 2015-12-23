/*
 * filename: loklakTelegram.js
 * using the telegram bot for loklak purposes
 * Authors: ["Hannan Ali (ali.abdulhannan@gmail.com)"]
 */

// this is the main bot communicating with telegram
// according to the text it will process the query
module.exports = function (bot) {
  // details about the bot on start
  bot.onText(/\/start/, function (msg, match) {
    var startMessage = `Loklak Telegram Bridge
To query the loklak server api for tweets
type /start [query]`
    console.log(msg)
    bot.sendMessage(msg.chat.id, startMessage)
  })
}
