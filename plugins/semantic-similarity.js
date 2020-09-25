const request = require('superagent');
const Papercups = require('../papercups');
const {sleep} = require('../utils');

const TEST_FAQS = [
  {
    q: 'what is papercups?',
    a:
      "it's a chat widget that you can embed on your website or mobile app so you can talk with your users :) ",
  },
  {
    q: 'how does papercups work?',
    a:
      'you can embed our chat widget on your website or mobile app so you can talk with your users :) ',
  },
  {
    q: 'what is the pricing?',
    a: "the first 2 users are free, and it's $40/month for up to 10 users",
  },
  {
    q: 'how much does it cost?',
    a: "the first 2 users are free, and it's $40/month for up to 10 users",
  },
  {
    q: 'who are you?',
    a: "my name is alex, i'm one of the co-creators of papercups :)",
  },
  {
    q: 'where are you?',
    a: "we're based in new york city",
  },
];

const getSemanticSimilarity = (a, b) => {
  // TODO: secure with https
  return request
    .post('http://bot.papercups.io/similarities')
    .send({text: [a, b]})
    .then((res) => {
      return Number(res.body.cosine_similarity);
    });
};

const findBestMatch = async (str, faqs = TEST_FAQS, min = 0.5) => {
  const promises = faqs.map(({q, a}) => {
    return getSemanticSimilarity(str, q).then((score) => {
      return {q, a, score};
    });
  });
  const scores = await Promise.all(promises);
  const [best] = scores
    .filter(({score}) => score > min)
    .sort((a, b) => b.score - a.score);
  console.log('Match scores:', scores);

  return best ? best.a : null;
};

const handleMessageCreated = async (res, message) => {
  const {body, conversation_id, customer_id} = message;

  if (!customer_id) {
    return res.json({ok: true});
  }

  try {
    const answer = await findBestMatch(body);

    if (!answer) {
      return res.json({ok: true});
    }

    await sleep(1000);
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

// TODO: get this working!
const demo = async (message, faqs = []) => {
  const {body, conversation_id, customer_id} = message;

  if (!customer_id) {
    return null;
  }

  try {
    const answer = await findBestMatch(body, faqs);

    if (!answer) {
      return null;
    }

    await sleep(400);
    const result = await Papercups.sendMessage({
      conversation_id,
      body: answer.toString(),
    });

    return result;
  } catch (err) {
    // Do nothing
    console.error(err);

    return null;
  }
};

module.exports = {
  demo,
  getSemanticSimilarity,
  findBestMatch,
  handleMessageCreated,
};
