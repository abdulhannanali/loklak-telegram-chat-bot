/*
 * Loklak telegram chat bot using Node.js Telegram API
 * Authors: ["Hannan Ali (abdulhannanali@outlook.com)"] // update this array in case you contribute
 * This is an open source project and we love open source
 * License: GNU GPL v3.0 LICENSE
 */
const TelegramBot = require('node-telegram-bot-api')
const lodash = require('lodash')

var loklakBot;

// Configurations specific to the development environment
if (process.env.NODE_ENV == 'development') {
 // in the case of development environment
 // place the keys in config/keys.js file
 // see README.md for more help
 require('./config/keys.js')()

 // in case of development mode polling
 try {
   loklakBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true})
   console.log("loklakBot is now running in development mode")
 }
 catch (error) {
   console.error(error)
   process.exit(1)
 }

 // logger for the bot
 require("./lib/botLogger")(loklakBot)
}
else {
 // in production environment keys should be already set as the environment variables
 // see README.md for more details regarding variables

 const PORT = process.env.PORT || 443
 const HOST = process.env.HOST || "0.0.0.0"
 const externalUrl = process.env.EXTERNAL_URL || 'https://rocky-coast-3915.herokuapp.com'

 try {
   // setting up webhook in case of production
   loklakBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
     webHook: {
       port: process.env.PORT,
       host: process.env.HOST
     }
   })

   loklakBot.setWebHook(externalUrl + ":443/bot" + process.env.TELEGRAM_BOT_TOKEN)
 }
 catch (error) {
   console.log("Error occured while setting up telegram webhook in production")
   console.error(error);
 }
}

// loklakBotModules
require("./lib/loklakTelegram.js")(loklakBot)
