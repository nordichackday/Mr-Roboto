import { Wit } from 'node-wit'

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
  getWeather(sessionId, context, cb) {
    console.log('getWeather')
    context.weather = 'Sunny'
    cb(context)
  },
  getNews(sessionId, context, cb) {
    console.log('getNews')
    context.news = 'news'
    cb(context)
  }
};

const client = new Wit('TGTM7ZQAJRZLVNGS5WU7MERPJUSRDZET', actions);
client.interactive();
