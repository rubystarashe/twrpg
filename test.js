const { Client } = require('discord-rpc')

const client = new Client({ transport: 'websocket' })
const clientId = '1016252391777108010';

client.on('open', () => console.log('abc'))

client.on('ready', () => {
  console.log("> Connected to Discord using Photoshop Rich Presence!");

});

client.login({ clientId }).catch(console.error);
