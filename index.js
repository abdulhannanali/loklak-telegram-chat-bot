/*
 * Loklak telegram chat bot using Node.js Telegram API
 * Authors: ["Hannan Ali (abdulhannanali@outlook.com)"] // update this array in case you contribute
 * This is an open source project and we love open source
 * License: MIT LICENSE
 */
const TelegramBot = require('node-telegram-bot-api')
const lodash = require('lodash')

var loklakBot;
process.env.NODE_ENV = "development"

// Configurations specific to the development environment
if (process.env.NODE_ENV == 'development') {
 // in the case of development environment
 // place the keys in config/keys.js file
 // see README.md for more help
 require('./config/keys.js')()

 // in case of development polling
 loklakBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true})
}
else {
 // in production environment keys should be already set as the environment variables
 // see README.md for more details regarding variables

 // setting up webhook in case of production
}

// loklakBotModules
require("./lib/loklakTelegram.js")(loklakBot)
