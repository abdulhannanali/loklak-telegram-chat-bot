/*
 * Loklak telegram chat bot using Node.js Telegram API
 * Authors: ['Hannan Ali (abdulhannanali@outlook.com)'] // update this array in case you contribute
 * This is an open source project and we love open source
 * License: GNU GPL v3.0 LICENSE
 */
const TelegramBot = require('node-telegram-bot-api')
const lodash = require('lodash')
const bluebird = require('bluebird')
const redis = require('redis')

var loklakBot;
var redisClient;
// Configurations specific to the development environment
if (process.env.NODE_ENV == 'development') {
 // in the case of development environment
 // place the keys in config/keys.js file
 // see README.md for more help
 require('./config/keys.js')()

 // local redis database incase of development
 var redisClient = redis.createClient()
 redisClient.on('error', function (error) {
   console.error(error)
   process.exit(1)
 })

 // in case of development mode polling
 try {
   loklakBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true})
   console.log('loklakBot is now running in development mode 🔨')
 }
 catch (error) {
   console.error(error)
   process.exit(1)
 }

 // logger for the bot
 require('./lib/botLogger')(loklakBot)
}
else {
 // in production environment keys should be already set as the environment variables
 // see README.md for more details regarding variables

 const PORT = process.env.PORT || 443
 const HOST = process.env.HOST || '0.0.0.0'
 const externalUrl = process.env.EXTERNAL_URL || 'https://rocky-coast-3915.herokuapp.com'
 const redisUrl = process.env.REDIS_DB_URL || ''
 const redisPass = process.env.REDIS_DB_PASS || ''

 try {
   // setting up webhook in case of production
   loklakBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
     webHook: {
       port: process.env.PORT,
       host: process.env.HOST
     }
   })

   loklakBot.setWebHook(externalUrl + ':443/bot' + process.env.TELEGRAM_BOT_TOKEN)
   console.log('loklakBot is now running in production mode and webhook has been successfully set up 🏭')
 }
 catch (error) {
   console.log('Error occured while setting up telegram webhook in production 🐛')
   console.error(error);
 }

 // connecting to the redis database on the url
 redisClient = redis.createClient(redisUrl, {})
 if (redisPass) {
   redis.auth(redisPass, (error) => {
     console.error(error)
     process.exit(1)
   })
 }

 redisClient.on('error', (error) => {
   console.log('Failed to connect to the redis database 🐛')
   console.log("URL = " + redisUrl)
   console.log("Pass ="  + redisPass)
   console.error(error)
   process.exit(1)
 })
}

redisClient.on('connect', () => {
  console.log("connected to the redis database 💾 👍 ")
  // loklakBotModules
  require('./lib/loklakTelegram.js')(loklakBot, redisClient)
})
