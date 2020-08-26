# Papercups — Webhooks Demo

Check our [guide](https://github.com/papercups-io/papercups/wiki/Event-Subscriptions-with-Webhooks) to getting started with webhooks on Papercups :tada:

https://github.com/papercups-io/papercups/wiki/Event-Subscriptions-with-Webhooks

## Demo Overview

- This demo is built with NodeJS on an Express server, which can be found in [`index.js`](https://github.com/reichert621/papercups-webhooks-demo/blob/master/index.js)
- The [`papercups.js`](https://github.com/reichert621/papercups-webhooks-demo/blob/master/papercups.js) file handles API requests to the Papercups server, to do things like retrieve conversation details and send messages
- Examples of our "plug-ins" can be found in the [`/plugins`](https://github.com/reichert621/papercups-webhooks-demo/tree/master/plugins) directory


### Example plug-ins

- **[Calculator plug-in](https://github.com/reichert621/papercups-webhooks-demo/blob/master/plugins/calculator.js)**: a handler that takes a message starting with the word `"calculate"` and evaluates the expression coming after
  - e.g. `calculate 5 * 10^3` responds with `5000`
- **[Google Dialogflow plug-in](https://github.com/reichert621/papercups-webhooks-demo/blob/master/plugins/dialogflow.js)**: a handler that integrations with a sample [Dialogflow](https://dialogflow.cloud.google.com/) agent we set up to respond to basic messages like "hello" and "test"
  - *NB: you'll have to use your own credentials here if you'd like to run the Dialogflow integration locally*
- **[Custom NLP plug-in](https://github.com/reichert621/papercups-webhooks-demo/blob/master/plugins/semantic-similarity.js)**: a handler that uses our own NLP model to respond to common questions based on our FAQs ([hardcoded in the code for now](https://github.com/reichert621/papercups-webhooks-demo/blob/master/plugins/semantic-similarity.js#L5))

### Environment variables

Check out our `.env.example` for the environment variables that are used in this project.

```
# Pass in your Papercups credentials as environment variables - be sure not to keep these out of git!
PAPERCUPS_EMAIL=test@test.com
PAPERCUPS_PASSWORD=supersecretpassword

# Environment variables for Google Dialogflow (for building chatbots)
GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/credentials.json"
DIALOGFLOW_PROJECT_ID=papercups-demo
```
