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

  // TODO: Add logging messages for the bot
  // TODO: Helpful output
  // TODO: Takes additional parameters to modify the output
}
