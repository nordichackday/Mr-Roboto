import { Wit } from 'node-wit'
import axios from 'axios'
import _ from 'lodash'

const actions = {
  say(sessionId, context, message, cb) {
    console.log(message);
    cb();
  },
  merge(sessionId, context, entities, message, cb) {
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
  }
};

const client = new Wit('TGTM7ZQAJRZLVNGS5WU7MERPJUSRDZET', actions);
client.interactive();
