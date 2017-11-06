'use strict';

class TelegramUsers {
	constructor() {
		this._data = null;
	}
	async get(id) {
		let item = null;
		if (this._data !== null) {
			item = this._data.find((item) => item.id === id);
		}
		return item;
	}

	async add(id) {
		let item = await this.get(id);
		if (item === null) {
			item = new Object();
			item.id = id;
			item.cards = [];
			item.activeCardId = -1;
			item.paymentType = '';
			if (this._data === null) {
				this._data = new Array();
			}

			this._data.push(item);	
		}
		return item;
	}
}
module.exports = TelegramUsers;