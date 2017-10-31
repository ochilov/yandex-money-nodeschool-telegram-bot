const config = require('config'); 
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = config.get('token')
const bot = new TelegramBot(TOKEN, {polling:true});

bot.on('message', msg => {
	const { chat:{id} } = msg;
	bot.sendMessage(id, 'Pong');
});