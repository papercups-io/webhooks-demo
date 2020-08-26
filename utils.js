const {mod} = require('mathjs');

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = {
  sleep,
};
