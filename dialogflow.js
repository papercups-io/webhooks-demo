const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const Papercups = require('./papercups');

const DIALOGFLOW_PROJECT_ID = process.env.DIALOGFLOW_PROJECT_ID || 'taro-v1';

const getAutomatedReply = async (text, sessionId = uuid.v4()) => {
  // A unique identifier for the given session
  console.log({sessionId});

  // Create a new session
  const client = new dialogflow.SessionsClient();
  const session = client.projectAgentSessionPath(
    DIALOGFLOW_PROJECT_ID,
    sessionId
  );

  // The text query request.
  const request = {
    session,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };

  const [response] = await client.detectIntent(request);

  if (!response) {
    return null;
  }

  const {queryResult: result} = response;
  const {queryText, fulfillmentText, intent, action} = result;

  if (!intent) {
    console.log('No intent matched.');

    return null;
  }

  switch (action) {
    case 'input.welcome':
      console.log(`> Query: "${queryText}" \n> Reply: "${fulfillmentText}"`);
      return fulfillmentText;
    case 'input.unknown':
    default:
      return null;
  }
};

const hasNotRepliedYet = async (conversationId) => {
  try {
    const {messages = []} = await Papercups.fetchConversation(conversationId);
    const hasAlreadyReplied =
      messages.filter((msg) => !!msg.user_id).length > 0;

    return !hasAlreadyReplied;
  } catch (err) {
    console.error('Failed to fetch conversation:', err);

    return false;
  }
};

const handleMessageCreated = async (res, message) => {
  const {body, conversation_id, customer_id} = message;

  if (!customer_id) {
    return res.json({ok: true});
  }

  const shouldAttemptReply = await hasNotRepliedYet(conversation_id);

  console.log({shouldAttemptReply, customer_id});

  if (!shouldAttemptReply) {
    return res.json({ok: true});
  }

  try {
    const answer = await getAutomatedReply(body);

    if (!answer) {
      return res.json({ok: true});
    }

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
  getAutomatedReply,
  handleMessageCreated,
};
