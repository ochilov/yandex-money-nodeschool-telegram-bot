'use strict';

// общие библиотеки
const config = require('config');
const TelegramMenu = require('./models/telegram-menu');

// библиотека для работы с ботом
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const BOT_TOKEN = config.get('token')

const bot = new Telegraf(BOT_TOKEN)
const telegramMenu = new TelegramMenu()

//bot.use(Telegraf.log())
bot.command('start', async (ctx) => {
	return ctx.reply('Приветствую', Markup
		.keyboard('Меню', 'Инфо', 'Выйти')
		.oneTime()
		.resize()
		.extra()
	)
})

bot.command('menu', async (ctx) => {
	const menu = await telegramMenu.getMainMenu(ctx);
	if (menu.status === 201) {
		return ctx.reply(menu.text, menu.items);
	}
	else {
		return ctx.reply('Не могу обработать комманду');
	}
 })


bot.hears(/.+/, async (ctx) => {
	let actionMenu = null;
	try {
		switch(ctx.match[0]) {
			case 'Меню' : {actionMenu = await telegramMenu.getMainMenu(ctx); break;}
			case 'Инфо' : {actionMenu = await {status : 201, text : 'Бот для работы с основными функциями ёДенег', items : []}; break;}
			case 'Выйти': {actionMenu = await {status : 201, text : 'Выход', items : []}; break;}
			default 	: {actionMenu = await telegramMenu.contractPayment(ctx);}
		}
	} catch (err) {
		console.log('catch error', err);
	}

	if (actionMenu !== null && actionMenu.status === 201) {
		//ctx.deleteMessage(ctx.chat.id, ctx.update.message.message_id);
		return ctx.reply(actionMenu.text, actionMenu.items);
	}
	else {
		return ctx.reply('Не могу обработать комманду\nstatus ' +  actionMenu.status + '\nerror ' + actionMenu.error);	
	}
})

bot.action(/.+/, async (ctx) => {
	let actionMenu = null;
	try {
		const names = ctx.match[0].split(':');
		switch(names[0]) {
			case 'menuMain': {
				actionMenu = await telegramMenu.getMainMenu(ctx); break;
			}
			case 'menuCards': {
				if 		(names.length === 2) {
					actionMenu = await telegramMenu.getCardMenu(ctx, names[1]);
				}
				else if (names.length > 2 && names[2] === 'history') {
					actionMenu = await telegramMenu.getCardHistory(ctx, names[1]);
				}
				else if (names.length > 3 && names[1] !== '-1' && names[2].indexOf('Payment') != -1) {
					actionMenu = await telegramMenu.checkCardAndSwitchPayment(ctx, names[1], names[3]);
				}
				else {
					actionMenu = await telegramMenu.getCards(ctx);
				}
				break;
			}
			case 'menuPayments': {
				if (names.length === 2) {
					actionMenu = await telegramMenu.getPayment(ctx, names[1]); 
				}
				else if (names.length > 2 && names[1] === 'doPay') {
					actionMenu = await telegramMenu.contractPayment(ctx, names[2]);
				}
				else {
					actionMenu = await telegramMenu.getPayments(ctx); 
				}
				break;
			}
		}
	} catch (err) {
		console.log('catch error', err);
	}

	if (actionMenu !== null && actionMenu.status === 201) {
		ctx.deleteMessage(ctx.chat.id, ctx.update.callback_query.message.message_id);
		return ctx.reply(actionMenu.text, actionMenu.items);
	}
	else {
		return ctx.reply('Не могу обработать комманду\nstatus ' +  actionMenu.status + '\nerror ' + actionMenu.error);	
	}
})

bot.startPolling();