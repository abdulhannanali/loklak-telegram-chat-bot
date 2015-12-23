/*
 * filename: botlogger.js
 * Helpful logger for the messages sent to the bot
 * Authors: ["Hannan Ali (ali.abdulhannan@gmail.com)"]
 */

/*
 * exports a function which requires a node telegram bot instance
 * throws an error if undefined
 */

module.exports = function (bot) {
  if (!bot) {
    throw new Error("No loklak bot instance given to botLogger.js")
  }

  // Add logging messages for the every general message the bot receives
  bot.on("message", function (msg) {
    console.log(`~~~~~Message Received Start~~~~ \n ${JSON.stringify(msg, null, 2)} \n ~~~~Message Received End~~~~~~`)
  })

  // TODO: Helpful output
  // TODO: Listen to different types of messages separately
}
