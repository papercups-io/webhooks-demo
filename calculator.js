const math = require('mathjs');
const Papercups = require('./papercups');

const handleMessageCreated = async (res, message) => {
  const {body, conversation_id} = message;
  const [prefix, ...rest] = body.split(' ');

  // If the message is not from a customer, ignore it
  if (prefix !== '/calculate' && prefix !== 'calculate') {
    return res.json({ok: true});
  }

  try {
    const expression = rest.join(' ');
    const answer = math.evaluate(expression);

    await Papercups.message({
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
