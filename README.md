# loklak-telegram-bridge

Integrating loklak with telegram api using [node.js](https://nodejs.org) to search and view stats and graphs on
telegram.

Demo bot link: https://telegram.me/loklaktweetbot

This project is in initial and a lot of the things are being developed. Any contribution will be
very appreciated. Cool beans. :smile:

## Running it on your own
In order to run this first fork this repo

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


### Contibutions
Please feel free to make a pull request and raise issues in case of some bugs. We need you 🐮🐄🐮


### LICENSE
GNU GPL v3.0 LICENSE (See [LICENSE.md](LICENSE.md) for more details)
