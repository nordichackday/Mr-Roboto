import { Wit } from 'node-wit'
import axios from 'axios'
import _ from 'lodash'

let entitiesGlobal = []

const actions = {
  say(sessionId, context, message, cb) {
    console.log(message);
    cb();
  },
  merge(sessionId, context, entities, message, cb) {
    entitiesGlobal[sessionId] = entities
    cb(context);
  },
  error(sessionId, context, err) {
    console.log(err.message);
  },
  getTopNews(sessionId, context, cb) {
    axios.get('https://www.dr.dk/tjenester/mimer/api/v2/articles/latest.json?limit=1')
      .then(response => {
        context.topNews = response.data.data[0].title
        cb(context)
      })
  },
  getTopNewsByTag(sessionId, context, cb) {
    axios.get('https://www.dr.dk/tjenester/mimer/api/v2/articles/latest.json?limit=1&tags[]=' + entitiesGlobal[sessionId].news_category[0].value)
      .then(response => {
        context.topNewsByTag = response.data.data[0].title
        cb(context)
      })
      .catch(response => {
        console.log(response)
      })
  }
};

const client = new Wit('TGTM7ZQAJRZLVNGS5WU7MERPJUSRDZET', actions);
client.interactive();
