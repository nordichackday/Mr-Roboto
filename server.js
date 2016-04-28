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
};

const client = new Wit('4PJSSXMVCQZGHPG6ADVZMEVTNJ4DIKCJ', actions);
client.interactive();
