const request = require('superagent');

const BASE_URL = process.env.PAPERCUPS_BASE_URL || 'https://app.papercups.io';

// TODO: this is just a hacky wrapper around the Papercups API...
// for now we just handle authenticating manually with email + password
class Papercups {
  constructor(email, password) {
    this.email = email;
    this.password = password;
    this.auth = {};
  }

  static init = ({email, password}) => {
    return new Papercups(email, password);
  };

  updateAuthInfo = (auth) => {
    this.auth = auth;
  };

  getAccessToken = async () => {
    if (this.auth && this.auth.token) {
      return this.auth.token;
    }

    const {token} = await this.login();

    return token;
  };

  getRefreshToken = () => {
    return (this.auth && this.auth.renew_token) || null;
  };

  login = async () => {
    return request
      .post(`${BASE_URL}/api/session`)
      .send({
        user: {
          email: this.email,
          password: this.password,
        },
      })
      .then((res) => res.body.data)
      .then((auth) => {
        this.updateAuthInfo(auth);

        return auth;
      });
  };

  refresh = async () => {
    const token = this.getRefreshToken();

    if (!token) {
      throw new Error('Missing refresh token!');
    }

    return request
      .post(`${BASE_URL}/api/session/renew`)
      .set('Authorization', token)
      .then((res) => res.body.data)
      .then((auth) => this.updateAuthInfo(auth));
  };

  sendMessage = async (params, retries = 1) => {
    const token = await this.getAccessToken();

    if (!token) {
      throw new Error('Invalid token!');
    }
    console.log('Attempting to send message:', params);
    return request
      .post(`${BASE_URL}/api/messages`)
      .set('Authorization', token)
      .send({message: params})
      .then((res) => res.body.data)
      .catch((err) => {
        if (err.status == 401 && retries > 0) {
          return this.refresh().then(() =>
            this.sendMessage(params, retries - 1)
          );
        }
      });
  };

  fetchConversation = async (conversationId, retries = 1) => {
    const token = await this.getAccessToken();

    if (!token) {
      throw new Error('Invalid token!');
    }

    return request
      .get(`${BASE_URL}/api/conversations/${conversationId}`)
      .set('Authorization', token)
      .then((res) => res.body.data)
      .catch((err) => {
        if (err.status == 401 && retries > 0) {
          return this.refresh().then(() =>
            this.fetchConversation(conversationId, retries - 1)
          );
        }
      });
  };
}

const client = Papercups.init({
  email: process.env.PAPERCUPS_EMAIL,
  password: process.env.PAPERCUPS_PASSWORD,
});

module.exports = client;
