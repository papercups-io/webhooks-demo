require('dotenv').config();

const express = require('express');
const CalculatorPlugin = require('./calculator');
const DialogflowPlugin = require('./dialogflow');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const api = express.Router();

api.all('/ping', (req, res) => res.json({message: 'pong'}));

api.post('/webhook/calculator', (req, res) => {
  console.log('Webhook event:', req.body);

  const {event, payload} = req.body;

  switch (event) {
    case 'message:created':
      return CalculatorPlugin.handleMessageCreated(res, payload);
    case 'webhook:verify':
    default:
      return res.send(req.body.payload);
  }
});

api.post('/webhook/dialogflow', (req, res) => {
  console.log('Webhook event:', req.body);

  const {event, payload} = req.body;

  switch (event) {
    case 'message:created':
      return DialogflowPlugin.handleMessageCreated(res, payload);
    case 'webhook:verify':
    default:
      return res.send(req.body.payload);
  }
});

app.use('/api', api);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀  Server listening on port ${port}`);
});