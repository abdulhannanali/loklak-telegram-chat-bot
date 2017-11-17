# loklak-telegram-bridge

[![Greenkeeper badge](https://badges.greenkeeper.io/abdulhannanali/loklak-telegram-chat-bot.svg)](https://greenkeeper.io/)

[![Join the chat at https://gitter.im/abdulhannanali/loklak-telegram-chat-bot](https://badges.gitter.im/abdulhannanali/loklak-telegram-chat-bot.svg)](https://gitter.im/abdulhannanali/loklak-telegram-chat-bot?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Integrating loklak with telegram api using [node.js](https://nodejs.org) to search and view stats and graphs on
telegram.

Demo bot link: https://telegram.me/loklaktweetbot

This project is in initial and a lot of the things are being developed. Any contribution will be
very appreciated. Cool beans. :smile:

## Running it on your own
In order to run this first clone this repo using this command
```
git clone https://github.com/abdulhannanali/loklak-telegram-chat-bot
```

After that run
```bash
npm install
```
in the root directory of the project

### Deployment and ENVIRONMENT VARIABLES

In case of local deployment. Go to `/config/keys.js` and enter all the environment variables required there.

In case of deploying on the server. Define the `EVIRONMENT VARIABLES` before hand. The environment variables you'll need
to define at least are
```
TELEGRAM_BOT_TOKEN  (obtain this by talking to BotFather)
PORT (The port required for the webhook)
HOST (The host required for the webhook)
```

## Routes working
- /start - to start the bot
- /search [query] - to retrieve the tweets about the query
- /help - to access the help
- /user - to get the user information (to be implemented yet)

## Integrations (raise an issue or make a PR if you have some in mind)
- Search the loklak server api and retrieve tweets (done)
- Get the user profile info (future)
- Integrate other loklak api endpoints into the bot such as:
   - [geocode.json](http://loklak.org/api.html#geocode)
   - [user.json](http://loklak.org/api.html#user)

### Screenshots
These are some links to screenshots in order to get a feel of how this bot looks and operates like

- [Start screen of loklaktweetbot (You can change for your one)](http://i.imgur.com/UmnRCIR.png)
- [/start reply screenshot](http://i.imgur.com/kGI7uSE.png)
- /user sample user retrieval
  - [image1](http://i.imgur.com/Z45MqNq.png)
  - [image2](http://i.imgur.com/YOwfcWe.png)
- /search sample user retrieval
  - [1 step way](http://i.imgur.com/aDAUEU7.png)
  - [2 step way](http://i.imgur.com/6ItjGt9.png)
- [/help reply](http://i.imgur.com/MHhwK8s.png)

### Contibutions
Please feel free to make a pull request and raise issues in case of some bugs. We need you 🐮🐄🐮


### LICENSE
GNU GPL v3.0 LICENSE (See [LICENSE.md](LICENSE.md) for more details)
