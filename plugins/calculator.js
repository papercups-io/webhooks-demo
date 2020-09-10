const math = require('mathjs');
const Papercups = require('../papercups');

const handleMessageCreated = async (res, message) => {
  const {body, conversation_id} = message;
  const [prefix, ...rest] = body.split(' ');

  // Only execute this if the message starts with '/calculate'
  if (prefix !== '/calculate' && prefix !== 'calculate') {
    return res.json({ok: true});
  }

  try {
    const expression = rest.join(' ');
    const answer = math.evaluate(expression);

    await Papercups.sendMessage({
      conversation_id,
      body: answer.toString(),
    });
  } catch (err) {
    // Do nothing
    console.error(err);
  }

  return res.json({ok: true});
};

module.exports = {
  handleMessageCreated,
};
