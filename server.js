import { Wit } from 'node-wit'
import axios from 'axios'
import _ from 'lodash'

let entitiesGlobal = []
let newsTips = []

const actions = {
  say(sessionId, context, message, cb) {
    console.log(message);
    cb();
  },
  merge(sessionId, context, entities, message, cb) {
    entitiesGlobal[sessionId] = _.assign({}, entitiesGlobal[sessionId], entities)
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
  },
  sendNewsTip(sessionId, context, cb) {
    newsTips.push(entitiesGlobal[sessionId].news_tip[0].value);
    cb();
  }
};

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
          Array.isArray(entities[entity]) &&
          entities[entity].length > 0 &&
          entities[entity][0].value
      ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const client = new Wit('TGTM7ZQAJRZLVNGS5WU7MERPJUSRDZET', actions);
client.interactive();
