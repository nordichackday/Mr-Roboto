import Botkit from 'botkit'
import { Wit } from 'node-wit'
import axios from 'axios'
import _ from 'lodash'
import express from 'express'

var controller = Botkit.slackbot({
    debug: true,
})

var bot = controller.spawn({
    token: process.env.SLACK_TOKEN
}).startRTM()

const sessionsGlobal = {}
const contextsGlobal = {}
let newsTips = []

const actions = {
  say(sessionId, context, message, cb) {
    const session = sessionsGlobal[sessionId]
    bot.reply(session, message)
    cb()
  },
  merge(sessionId, context, entities, message, cb) {
    console.log(context, entities)
    cb(_.assign(context, entities))
  },
  error(sessionId, context, error) {
    console.log(error.message)
  },
  getTopNews(sessionId, context, cb) {
    axios.get('https://www.dr.dk/tjenester/mimer/api/v2/articles/latest.json?limit=3')
      .then(response => {
        context.topNews = _.map(response.data.data, mapNews).join('\n')
        cb(context)
      })
      .catch(response => {
        console.trace(response)
      })
  },
  getTopNewsByTag(sessionId, context, cb) {
      axios.get('https://www.dr.dk/tjenester/mimer/api/v2/articles/latest.json?limit=3&tags[]=' + context.news_category[0].value)
        .then(response => {
          context.topNewsByTag = _.map(response.data.data, mapNews).join('\n')
          cb(context)
        })
        .catch(response => {
          console.trace(response)
        })
  },
  sendNewsTip(sessionId, context, cb) {
    newsTips.push(context.news_tip[0].value)
    cb()
  },
  deleteTopNewsByTag(sessionId, context, cb) {
    delete context.topNewsByTag
    cb(context)
  },
  deleteNewsTip(sessionId, context, cb) {
    delete context.newsTip
    cb(context)
  },
  deleteTopNews(sessionId, context, cb) {
    delete context.topNews
    cb(context)
  }
}

function mapNews(newsItem) {
  let image = ''
  if(newsItem.images.length) {
    image = newsItem.images[0].url
  }
  const url = newsItem.url
  const title = newsItem.title
  const summary = newsItem.summary

  return image+'\n'+url+'\n*'+title+'*\n'+summary
}

const client = new Wit('TGTM7ZQAJRZLVNGS5WU7MERPJUSRDZET', actions)

controller.on(['direct_mention', 'direct_message'], function(bot, message) {
  const context1 = contextsGlobal[message.user + message.channel || '']
  sessionsGlobal[message.user + message.channel || ''] = message
  client.runActions(message.user + message.channel || '', message.text, context1, (e, context2) => {
    console.log(context2)
    if (e) {
      console.log('Oops! Got an error: ' + e)
      return
    }
    contextsGlobal[message.user + message.channel || ''] = context2
    console.log('The session state is now: ' + JSON.stringify(context2))
  })
})

const app = express()

app.get('/', function (req, res) {
  res.send('<h1>News Tips</h1>' + _.map(newsTips, newsTip => `<h2>${newsTips}</h2>`).join(''))
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
