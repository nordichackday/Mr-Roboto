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

const actions = {
  say(sessionId, context, message, cb) {
    const session = sessionsGlobal[sessionId]
    bot.reply(session, message)
    cb();
  },
  merge(sessionId, context, entities, message, cb) {
    entitiesGlobal[sessionId] = entities
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
    if(!_.isUndefined(entitiesGlobal[sessionId].news_category)) {
      axios.get('https://www.dr.dk/tjenester/mimer/api/v2/articles/latest.json?limit=1&tags[]=' + entitiesGlobal[sessionId].news_category[0].value)
        .then(response => {
          context.topNewsByTag = response.data.data[0].title
          cb(context)
        })
        .catch(response => {
          console.trace(response)
        })
    } else {
      cb(context)
    }
  }
}

const client = new Wit('TGTM7ZQAJRZLVNGS5WU7MERPJUSRDZET', actions);

controller.on(['direct_mention', 'direct_message'], function(bot, message) {
  console.log(message)
  const context1 = {}
  sessionsGlobal[message.ts] = message
  client.runActions(message.ts, message.text, context1, (e, context2) => {
    if (e) {
      console.log('Oops! Got an error: ' + e);
      return;
    }
    console.log('The session state is now: ' + JSON.stringify(context2));
  })
})