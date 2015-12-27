/*
 * loklakUser.js
 * module for integrating the user api with loklakTelegram
 * allows the 2 step process retrieval too
 */

const request = require('request')
const Promise = require('promise')

module.exports = function (bot, redisClient, loklakRedis, loklak) {

  // validates and get the user provided the regex is in the lines of /user.*/
  function validateUser (msg, match) {
    if (match[1] && match[1].trim()) {
      return sendUserInfo(msg, match[1].trim())
    }
    else {
      return undefined;
    }
  }

  // takes the screen name and sends the information back to the user
  function sendUserInfo(msg, screen_name) {
    return loklak.getUserInfo(screen_name)
      .then(function (userInfo) {
        if (isUser(userInfo)) {
          // formatting the user info
          var userMessage = formatUserInfo(userInfo)

          // sending the user info back
          sendUserMessage(msg, userMessage)
            .then(() => {
              sendUserImage(msg, getImageLink(userInfo))
              sendUserLocation(msg, userInfo)
            })
        }
        else {
          notFoundUserMessage(msg, userInfo, screen_name)
        }
      })
      .catch((error) => {
        errorMessage(msg, error)
      })
  }

  // returns true if the userInfo and user is present in the userInfo
  // else returns false
  function isUser(userInfo) {
    return userInfo && userInfo.user
  }

  // sends a message for the not found user
  // returns a promise which is successful if the message is sent
  function notFoundUserMessage(msg, userInfo, screen_name) {
    return new Promise(function (resolve, reject) {
      if (!userInfo || !screen_name) {
        reject(new Error("userInfo or the screen name not entered"))
      }
      else {
        bot.sendMessage(msg.chat.id, `Sorry! @${screen_name} does not exist in the twitter land`)
          .then(() => resolve())
          .catch((error) => reject(error))
      }
    })
  }


  // returns the image link if foundos
  function getImageLink(userInfo) {
    if (userInfo && userInfo.user && userInfo.user.profile_image_url) {
      return userInfo.user.profile_image_url
    }
  }

  // sends the user info back to the user
  // returns a Promise which is successful if the message is sent successfully
  function sendUserMessage(msg, userMessage) {
    return new Promise(function (resolve, reject) {
      if (!userMessage) {
        reject(new Error("Sorry! No user message given"))
      }
      else {
        bot.sendMessage(msg.chat.id, userMessage)
          .then(function () {
            resolve()
          })
          .catch(function (error) {
            reject(error)
          })
      }
    })
  }

  // sends an image to the user
  // returns a promise
  function sendUserImage(msg, link) {
    return new Promise(function (resolve, reject) {
      if (!link) {
        reject(new Error("No link given"))
      }
      else {
        link = profileImageSize(link, "original")
        bot.sendPhoto(msg.chat.id, createImageStream(link), {
          reply_to_message_id: msg.message_id
        })
        .then(function () {
          resolve()
        })
        .catch(function (error) {
          reject(error)
        })
      }
    })
  }

  // formats the image according to the size given
  // provided the link comes with _link at the end
  function profileImageSize(link, size) {
    if (!link) {
      throw new Error("No link entered for image sizing")
    }
    switch (size) {
      case "original":
        return link.replace("_normal", "")
        break;
      default:
        return link;
        break;
    }
  }

  // creates a pipable stream of the given image
  function createImageStream(link) {
    if (link) {
      var image = request(link)
    }

    // event listener in case if there's something wrong with the stream
    image.on("error", function (error) {
      console.log("Error while piping the image")
      console.log(`link = ${link}`)
      console.error(error)
    })

    return image
  }

  // send the user location
  function sendUserLocation(msg, userInfo) {
    return new Promise(function (resolve, reject) {
      if (userInfo && userInfo.user.location_point) {
        var [lon, lat] = userInfo.user.location_point
          bot.sendLocation(msg.chat.id, lat, lon, {
          reply_to_message_id: msg.message_id
        })
        .then(() => resolve())
        .catch((error) => reject(error))
      }
      else {
        console.log("User location not found for " + userInfo.user.screen_name)
        reject(new Error("location not found"))
      }
    })
  }

  // in case if an error occurs during the progress
  // return a promise which is successful if the message is sent successfully
  function errorMessage(msg, error) {
    console.error((error))
    return bot.sendMessage(msg.chat.id, "Hey! An error occured while searching for 🙎 user", {
      reply_to_message_id: msg.message_id
    })
  }




  // formats the userInfo using the given template
  // returns the userMessage back
  function formatUserInfo (userInfo) {
    try {
      var userMessage = `Name: ${userInfo.user.name} ${userInfo.user.verified ? '✅ (Verified Profile)' : ''}
${userInfo.user.location ? `Location: 🏠 ${userInfo.user.location}` : ''}
Private: ${userInfo.user.protected ? '🔒 (protected)': '🔓 (not protected)'}
Followers: 🙎 ${userInfo.user.followers_count}
Likes: ❤️ ${userInfo.user.favourites_count}
Tweets: 🐦 ${userInfo.user.statuses_count}
Description: 📄 ${userInfo.user.description} 📃
Twitter profile link: 🔗 https://twitter.com/${userInfo.user.screen_name}`

    return userMessage
    }
    catch (error) {
      // this will be catched in the catch block of the user
      console.log("error while formatting the mesage for user")
      throw (error)
    }

  }

  // maintains a user session for the 2 step verification
  function maintainUserSession(msg, match) {

  }

  return {
    validateUser: validateUser,
    sendUserInfo: sendUserInfo
  }
}
