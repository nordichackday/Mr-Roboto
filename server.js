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
        cb(context)
      })
  },
  getTopNewsByTag(sessionId, context, cb) {
    if(!_.isUndefined(context.news_category)) {
      axios.get('https://www.dr.dk/tjenester/mimer/api/v2/articles/latest.json?limit=3&tags[]=' + context.news_category[0].value)
        .then(response => {
          context.topNewsByTag = _.map(response.data.data, mapNews).join('\n')
          cb(context)
        })
        .catch(response => {
          console.trace(response)
          cb(context)
        })
    } else {
      cb({})
    }
  },
  getProgramsByName(sessionId, context, cb) {
    if(!_.isUndefined(context.program_name)) {
      axios.get('http://www.dr.dk/mu-online/api/1.3/page/tv/programs-search/' + context.program_name[0].value)
        .then(response => {
          if(response.data.Programs.Items.length) {
            context.programsByName = _.map(response.data.Programs.Items, mapProgram).join('\n')
          } else {
            context.programByName = 'Jeg kunne ikke finde programmet'
          }
          cb(context)
        })
        .catch(response => {
          console.trace(response)
          cb(context)
        })
    } else {
      cb({})
    }
  },
  sendNewsTip(sessionId, context, cb) {
    if(!_.isUndefined(context.news_tip)) {
      newsTips.push(context.news_tip[0].value)
    }
    cb(context)
  },
  deleteTopNewsByTag(sessionId, context, cb) {
    cb({})
  },
  deleteNewsTip(sessionId, context, cb) {
    cb({})
  },
  deleteTopNews(sessionId, context, cb) {
    cb({})
  },
  deleteProgramsByName(sessionId, context, cb) {
    cb({})
  }
}

function mapNews(news) {
  let image = ''
  if(news.images.length) {
    image = news.images[0].url
  }
  const url = news.url
  const title = news.title
  const summary = news.summary

  return image+'\n'+url+'\n*'+title+'*\n'+summary
}

function mapProgram(program) {
  const url = `https://www.dr.dk/tv/se/${program.SeriesSlug}/${program.Slug}`
  const title = program.Title

  return url+'\n*'+title
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
  res.send(`<div style="font-family: sans-serif; width: 600px; margin: 50px auto"><h1>News Tips</h1><hr />` + _.map(newsTips, newsTip => `<h2>${newsTips}</h2>`).join('') + '</div>')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
