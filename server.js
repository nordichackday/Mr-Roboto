import Botkit from 'botkit'
import { Wit } from 'node-wit'
import axios from 'axios'
import _ from 'lodash'

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: 'xoxb-38606867408-PmyVviEk9zqZpu9S06VO1bnx'
}).startRTM();

const entitiesGlobal = []
const sessionsGlobal = {}
let newsTips = []

const actions = {
  say(sessionId, context, message, cb) {
    const session = sessionsGlobal[sessionId]
    bot.reply(session, message)
    cb();
  },
  merge(sessionId, context, entities, message, cb) {
    console.log(entities)
    entitiesGlobal[sessionId] = _.assign({}, getEntities(sessionId), entities)
    cb(context);
  },
  error(sessionId, context, error) {
    console.log(error.message);
  },
  getTopNews(sessionId, context, cb) {
    axios.get('https://www.dr.dk/tjenester/mimer/api/v2/articles/latest.json?limit=1')
      .then(response => {
        context.topNews = response.data.data[0].title
        cb(context)
      })
      .catch(response => {
        console.trace(response)
      })
  },
  getTopNewsByTag(sessionId, context, cb) {
    if(!_.isUndefined(getEntities(sessionId).news_category)) {
      axios.get('https://www.dr.dk/tjenester/mimer/api/v2/articles/latest.json?limit=1&tags[]=' + entitiesGlobal[sessionId].news_category[0].value)
        .then(response => {
          image = response.data.data[0].images[0].url
          url = response.data.data[0].url
          title = response.data.data[0].title
          summary = response.data.data[0].summary

          context.topNewsByTag = image+'\n*'+url+title+'*\n'+summary
          cb(context)
        })
        .catch(response => {
          console.trace(response)
        })
    } else {
      cb(context)
    }
  },
  sendNewsTip(sessionId, context, cb) {
    console.log(getEntities(sessionId))
    newsTips.push(getEntities(sessionId).news_tip[0].value);
    cb();
  }
}

const client = new Wit('TGTM7ZQAJRZLVNGS5WU7MERPJUSRDZET', actions);

controller.on(['direct_mention', 'direct_message'], function(bot, message) {
  console.log(message)
  const context1 = {}
  sessionsGlobal[message.user + message.channel || ''] = message
  client.runActions(message.user + message.channel || '', message.text, context1, (e, context2) => {
    if (e) {
      console.log('Oops! Got an error: ' + e);
      return;
    }
    console.log('The session state is now: ' + JSON.stringify(context2));
  })
})

function getEntities(sessionId) {
  return entitiesGlobal[sessionId] || {}
}