const { Client } = require('discord-rpc')

const client = new Client({ transport: 'ipc' })
const clientId = '1016252391777108010';

client.on('ready', () => {
  console.log("> Connected to Discord using Photoshop Rich Presence!");

});

client.login({ clientId, scopes: ['rpc'] }).catch(console.error);
