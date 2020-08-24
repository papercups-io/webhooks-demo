const request = require('superagent');

const BASE_URL = process.env.PAPERCUPS_BASE_URL || 'http://localhost:4000';
// NB: this expires after 30 mins
// TODO: make it easier to authenticate
const ACCESS_TOKEN = process.env.PAPERCUPS_ACCESS_TOKEN;

console.log({ACCESS_TOKEN});

const fetchConversation = async (conversationId, token = ACCESS_TOKEN) => {
  if (!token) {
    throw new Error('Invalid token!');
  }

  return request
    .get(`${BASE_URL}/api/conversations/${conversationId}`)
    .set('Authorization', token)
    .then((res) => res.body.data);
};

const message = async (params, token = ACCESS_TOKEN) => {
  if (!token) {
    throw new Error('Invalid token!');
  }

  return request
    .post(`${BASE_URL}/api/messages`)
    .set('Authorization', token)
    .send({message: params})
    .then((res) => res.body.data);
};

module.exports = {
  fetchConversation,
  message,
};
