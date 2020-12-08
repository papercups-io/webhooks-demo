const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const Papercups = require('../papercups')(process.env.PAPERCUPS_API_KEY);

const {sleep} = require('../utils');

const DIALOGFLOW_PROJECT_ID =
  process.env.DIALOGFLOW_PROJECT_ID || 'papercups-demo';

const getAutomatedReply = async (text, sessionId = uuid.v4()) => {
  // A unique identifier for the given session
  console.log({sessionId});

  // Set up credentials with env variables
  const credentials = {
    private_key: process.env.DIALOGFLOW_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
    project_id: process.env.DIALOGFLOW_PROJECT_ID,
  };

  const config = {
    credentials,
    projectId: credentials.project_id,
  };

  // Create a new session
  const client = new dialogflow.SessionsClient(config);
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
    case 'input.test':
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

  await sleep(2000);
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

module.exports = {
  getAutomatedReply,
  handleMessageCreated,
};
