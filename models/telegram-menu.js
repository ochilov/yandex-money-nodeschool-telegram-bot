'use strict';

// общие библиотеки
const config = require('config');
const CardInfo = require('card-info');

const bankUtils = require('../libs/utils');
const TelegramUsers = require('./telegram-users');

// библиотека сетевый запросов
const axios = require('axios');

// библиотека для работы с ботом
const Telegraf = require('telegraf')
const Extra = require('telegraf//extra')
const Markup = require('telegraf/markup')

class TelegramMenu {
	//=========================================================================
	constructor() {
		this.telegramUsers = new TelegramUsers();
	}

	//=========================================================================
	// ГЛАВНОЕ
	//=========================================================================
	async getMainMenu(ctx) {
		const userId = ctx.chat.id;
		const user = await this.telegramUsers.add(userId);
		if (user !== null) {
			user.cards.length = 0;
			user.activeCardId = -1;
		}

		let status = 201;
		const text = 'Главное меню';
		const btnCards		= Markup.callbackButton('💳 Мои карты', 'menuCards');
		const btnOperations = Markup.callbackButton('💰 Платежи' , 'menuPayments');
		const items = Markup.inlineKeyboard([[btnCards], [btnOperations]]).resize(false).extra();
		
		return {
			status,
			text,
			items
		};
	}


	//=========================================================================
	// КАРТЫ
	//=========================================================================

	async getCards(ctx) {
		const userId = ctx.chat.id;
		let status = 200;
		let error = '';
		let text = 'Мои карты';
		let items = {};

		const user = await this.telegramUsers.add(userId);
		if (user !== null) {
			user.cards.length = 0;
			user.activeCardId = -1;
			user.paymentType = '';
		}

		let paymentMenu = '';
		const menuPaymentPos = ctx.match[0].indexOf('menuPayment');
		if (menuPaymentPos !== -1) {
			paymentMenu = ':' + ctx.match[0].substr(menuPaymentPos);
		}

		const btnMenu  = Markup.callbackButton('🔙 Главное меню' , 'menuMain');
		await axios.get(`${config.server}/cards`)
			.then(function (response) {
				status = 201;
				
				const buttons = [];
				for (let i = 0, count = response.data.length; i < count; ++i) {
					const item = response.data[i];
					const cardInfo = new CardInfo(item.cardNumber);
					const hidedNum = bankUtils.hideCardNumber(item.cardNumber, 4, 9, '*', 2);
					const caption = bankUtils.getShortName(cardInfo.bankName, 8) + ' ' + hidedNum;
					const name = `menuCards:${item.id}` + paymentMenu;
					const btn = Markup.callbackButton(caption, name);
					buttons.push([btn]);
					if (user !== null) {
						user.cards.push(item);
					}
				}
				buttons.push([btnMenu]);
				items = Markup.inlineKeyboard(buttons).resize().extra();
				
			})
			.catch(function (err) {
				status = 404;
				error = err;
			});
		return {
			status,
			text,
			items,
			error
		};
	}

	async getCardMenu(ctx, id) {
		const userId = ctx.chat.id;
		const cardId = Number(id);
		let status = 200;
		let error = '';
		let text = 'Карта';
		let items = {};

		const user = await this.telegramUsers.get(userId);
		if (user !== null) {
			const buttons = [];
			const card = user.cards.find((item) => item.id === cardId);
			if (card !== null) {
				status = 201;
				user.activeCardId = card.id;
				const cardInfo = new CardInfo(card.cardNumber);
				text = cardInfo.bankName 
					 + '\n' + cardInfo.numberNice
					 + '\n' + cardInfo.brandAlias
					 + '\nБаланс: ' + card.balance + ' руб';
				
				buttons.push([Markup.callbackButton('💰 Платежи' , 'menuPayments')]);
				buttons.push([Markup.callbackButton('📃 История' , `menuCards:${card.id}:history`)]);
			}

			buttons.push([Markup.callbackButton('🔙 Главное меню' , 'menuMain')]);
			items = Markup.inlineKeyboard(buttons).resize().extra();
		}
		else {
			status = 404;
			error = 'Не удалось найти пользователя';
		}
		return {
			status,
			text,
			items,
			error
		};
	}

	async getCardHistory(ctx, id) {
		const userId = ctx.chat.id;
		const cardId = Number(id);
		let status = 200;
		let error = '';
		let text = 'История по карте';
		let items = {};

		const user = await this.telegramUsers.get(userId);
		if (user !== null) {
			const buttons = [];
			const card = user.cards.find((item) => item.id === cardId);
			if (card !== null) {
				const link = `${config.server}/cards/${card.id}/transactions/`;
				await axios.get(link)
					.then(function (response) {
						status = 201;
						const maxHistory = 10;	
						const buttons = [];
						let data = [];	//храним ответку в тодельном массиве, т.к. при условии, что в выборке имеется только один пункт, то возвращается не массив, а сам объект
						if (response.data !== null && response.data !== undefined) {
							if (Object.prototype.hasOwnProperty.call(response.data, 'length')) {
								data = response.data;
							}
							else {
								data.push(response.data);
							}
						}
						for (let i = 0, count = data.length; i < count; ++i) {
							const item = data[i];
							let operation = '';
							switch(item.type) {
								case 'paymentMobile': {operation = `Оплата мобильной связи\n ${item.data}`; break;}
								case 'card2Card'	: {operation = `Перевод на карту\n ${item.data}`; break;}
								case 'prepaidCard'	: {operation = `Оплата с карты\n ${item.data}`; break;}
								default 			: {operation = item.type + ', ' + item.data;}
							}
							text += '\n' + operation;
							text += `\nСумма: ${item.sum} руб`;
							text += `\n${item.time}\n`;
						}
						buttons.push([Markup.callbackButton('🔙 Главное меню' , 'menuMain')]);
						items = Markup.inlineKeyboard(buttons).resize().extra();	
					})
					.catch(function (err) {
						status = 404;
						error = err;
						console.log('axios catch', err);
					});
			}
		}
		else {
			status = 404;
			error = 'Не удалось найти пользователя';
		}

		return {
			status,
			text,
			items,
			error
		};
	}


	//=========================================================================
	// ПЛАТЕЖИ
	//=========================================================================
	async getPayments(ctx) {
		const userId = ctx.chat.id;
		let status = 201;
		let error = '';
		const text = 'Платежи';
		const btnPhone = Markup.callbackButton('☎️ Телефон', 'menuPayments:Phone');
		const btnTrans = Markup.callbackButton('🔃 Перевод', 'menuPayments:Trans');
		//const btnBack  = Markup.callbackButton('🔙 ...', 'menuBack');
		const btnMenu  = Markup.callbackButton('🔙 Главное меню' , 'menuMain');
		const items = Markup.inlineKeyboard([
				[btnPhone], [btnTrans], [/*btnBack, */btnMenu]
			]).resize(false).extra();
		return {
			status,
			text,
			items,
			error
		};
	}

	async getPayment(ctx, type) {
		const userId = ctx.chat.id;
		const user = await this.telegramUsers.get(userId);
		let status = 201;
		let error = '';
		let text = 'Платежи';
		let items = {};
		if (user !== null) {
			user.paymentType = '';
			const buttons = [];
			let card = null;
			if (user.activeCardId !== -1)
				card = user.cards.find((item) => item.id === user.activeCardId);
			if (card === null) {
				text = 'Выберите источник для списания средств';
				let menuName = 'menuCards';
				if (ctx.match[0] !== '') {
					menuName += `:${-1}:${ctx.match[0]}`;	
				}
				buttons.push([Markup.callbackButton('💳 Мои карты', menuName)]);	
			}
			else {
				if (type === 'Phone') {
					user.paymentType = 'pay';
					text = 'Введите номер телефона и сумму через пробел.\nИли выберите пункт меню:';
				}
				else {
					user.paymentType = 'transfer';
					text = 'Введите номер карты и сумму через пробел.\nИли выберите пункт меню:';
				}
			}
			buttons.push([Markup.callbackButton('🔙 Главное меню', 'menuMain')]);
			items = Markup.inlineKeyboard(buttons).resize().extra();
		}
		else {
			status = 404;
			error = 'Не удалось найти пользователя';
		}

		return {
			status,
			text,
			items,
			error
		};
	}

	async checkCardAndSwitchPayment(ctx, id, operationData) {
		const userId = ctx.chat.id;
		const cardId = Number(id);
		const user = await this.telegramUsers.get(userId);

		let status = 200;
		let text = '';
		let error = '';
		let items = [];
		if (user !== null) {
			user.activeCardId = cardId;
			return this.getPayment(ctx, operationData);
		}
		else {
			status = 404;
			error  ='Не удалось найти пользователя';
		}
		return {
			status,
			error,
			items,
			text
		};
	}

	async contractPayment(ctx) {
		const params = ctx.match[0].split(' ');
		let target = '';
		let sum = 0;
		if (params.length === 2) {
			target = params[0];
			sum = Number(params[1]); 	
		}
		if (target ==='' || sum === NaN || sum <= 0) {
			return {
				status: 401,
				error : 'Введены не верные данные',
				items : [],
				text : ''
			};
		}


		const userId = ctx.chat.id;
		const user = await this.telegramUsers.get(userId);

		let status = 200;
		let text = '';
		let error = '';
		let items = [];
		if (user !== null) {
			let card = null;
			if (user.activeCardId !== -1)
				card = user.cards.find((item) => item.id === user.activeCardId);
			if (card !== null && user.paymentType !== '') {
				let link = `${config.server}/cards/${card.id}/${user.paymentType}`;
				let postData = {};
				if (user.paymentType === 'pay') {
					postData = {phoneNumber:target, sum:sum};
				}
				else {
					postData = {target:target, sum:sum};
				}
				await axios.post(link, postData)
					.then((response) => {
						status = 201;
						text = 'Операция выполнена успешно';
						items = Markup.inlineKeyboard([[Markup.callbackButton('🔙 Главное меню', 'menuMain')]]).resize().extra();
					})
					.catch((err) => {
						status = 404;
						error = err;
					});
			}
			else {
				status = 404;
				error  ='Не выбрана активная карта';		
			}
		}
		else {
			status = 404;
			error  ='Не удалось найти пользователя';
		}
		return {
			status,
			error,
			items,
			text
		};
	}
}
module.exports = TelegramMenu;