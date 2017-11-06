'use strict';

const bankUtils = {
	/**
	 * Типы банковскиx карт
	 * @type {Object}
	 */
	cardTypes: {
		VISA: 'visa',
		MAESTRO: 'maestro',
		MASTERCARD: 'mastercard',
		MIR: 'mir'
	},

	banksShortName: {
		'Абсолют Банк': 'Абсолют',
		'Альфа-Банк' : 'Альфа',
		'Сетелем Банк' : 'Сетелем',
		'Газпромбанк': 'Газпром',
		'ФК Открытие' : 'Открытие',
		'Промсвязьбанк' : 'ПСБ',
		'Райффайзенбанк' :'Райффайзен',
		'Сбербанк России':'Сбербанк',
		'Тинькофф Банк' : 'Тинькофф'
	},

	/**
	 * Проверяет тип карты
	 * @param {Number} val номер карты
	 * @returns {String} тип карты
	 */
	getCardType(val) {
		// Бины ПС МИР 220000 - 220499
		const mirBin = /^220[0-4]\s?\d\d/;

		const firstNum = val[0];

		switch (firstNum) {
			case '2': {
				if (mirBin.test(val)) {
					return bankUtils.cardTypes.MIR;
				}

				return '';
			}
			case '4': {
				return bankUtils.cardTypes.VISA;
			}
			case '5': {
				const secondNum = val[1] || '';

				if (secondNum === '0' || secondNum > '5') {
					return bankUtils.cardTypes.MAESTRO;
				}

				return bankUtils.cardTypes.MASTERCARD;
			}
			case '6': {
				return bankUtils.cardTypes.MAESTRO;
			}
			default: {
				return '';
			}
		}
	},

	/**
	 * Форматирует номер карты, используя заданный разделитель
	 *
	 * @param {String} originCardNumber номер карты
	 * @param {String} delimeter = '\u00A0' разделитель
	 * @returns {String} форматированный номер карты
	 */
	formatCardNumber(originCardNumber, delimeter = '\u00A0') {
		const formattedCardNumber = [];
		let cardNumber = originCardNumber;
		if (cardNumber) {
			while (cardNumber && typeof cardNumber === 'string') {
				formattedCardNumber.push(cardNumber.substr(0, 4));
				cardNumber = cardNumber.substr(4);
				if (cardNumber) {
					formattedCardNumber.push(delimeter);
				}
			}
		}
		return formattedCardNumber.join('');
	},

	/**
	 * Проверяет номер карты по алгоритму Луна
	 *
	 * @param {String} value номер карты
	 * @returns {Boolean}
	 */
	validateCardNumber(value) {
		// accept only digits, dashes or spaces
		if (/[^0-9-\s]+/.test(value)) return false;

		// The Luhn Algorithm. It's so pretty.
		var nCheck = 0, nDigit = 0, bEven = false;
		value = value.replace(/\D/g, "");

		for (var n = value.length - 1; n >= 0; n--) {
			var cDigit = value.charAt(n),
				  nDigit = parseInt(cDigit, 10);

			if (bEven) {
				if ((nDigit *= 2) > 9) nDigit -= 9;
			}

			nCheck += nDigit;
			bEven = !bEven;
		}

		return (nCheck % 10) == 0;
	},

	/**
	 * Форматирует номер карты, используя заданный разделитель
	 *
	 * @param {String} originCardNumber номер карты
	 * @param {String} delimeter = '\u00A0' разделитель
	 * @returns {String} форматированный номер карты
	 */
	hideCardNumber(originCardNumber, begin = 6, count = 7, replace = '*', rcount = 0) {
		let cardNumber = originCardNumber;
		if (cardNumber) {
			let len = cardNumber.length;
			if (begin < len) {
				let rest = len - (begin + count);   
				if (rest < 0)
					count += rest;
				cardNumber = originCardNumber.substr(0, begin);
				if (rcount === 0 || rcount > count)
					rcount = count;
				for (let i = 0; i < rcount; ++i)
					cardNumber += replace; 
				cardNumber += originCardNumber.substr(begin+count);  
			}
		}
		return cardNumber;
	},

	/*
	*/
	getShortName(fullName, needSymbols = 0) {
		let name = fullName;
		if (bankUtils.banksShortName.hasOwnProperty(fullName)) {
			name = bankUtils.banksShortName[fullName];
		}
		if (needSymbols) {
			if (name.length > needSymbols) {
				name = name.substr(0, needSymbols);
			}
			else {
				while (name.length < needSymbols) {
					name += ' ';
				}
			}
		}
		return name;
	}
};

module.exports = bankUtils;
