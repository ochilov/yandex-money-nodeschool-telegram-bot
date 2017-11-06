const bankUtils = require('../libs/utils');
const CardInfo = require('card-info'); 


const cardNumber = "405870234567891";
console.log(">> cardNumber = " + cardNumber);
console.log(">> Test bankUtils");
console.log(">>   .getCardType(num): " + bankUtils.getCardType(cardNumber));
const hidedNum = bankUtils.hideCardNumber(cardNumber, 4, 9, '*', 2);
console.log(">>   .hideCardNumber(num): " + hidedNum);
console.log(">>   .formatCardNumber(hidedNum): " + bankUtils.formatCardNumber(hidedNum));

console.log(">> Test CardInfo");
const cardInfo = new CardInfo(cardNumber);
console.log(">>   .brandAlias" + cardInfo.brandAlias);
console.log(">>   .codeName" + cardInfo.codeName);
console.log(">>   .bankName" + cardInfo.bankName);

const name = cardInfo.bankName + ' ' + hidedNum; 
console.log(">>   .name: " + name);
console.log(">>   .shortName: " + bankUtils.getShortName(cardInfo.bankName) + "!");


console.log(">>   other short names");
console.log(">>   ОТП БАНК: " + bankUtils.getShortName('ОТП БАНК', 8) + "!");
console.log(">>   123: " + bankUtils.getShortName('123', 8) + "!");
console.log(">>   12345678: " + bankUtils.getShortName('12345678', 8) + "!");
console.log(">>   12345678910: " + bankUtils.getShortName('12345678910', 8) + "!");
console.log(">>   123 dsdsdwedssd: " + bankUtils.getShortName('123 dsdsdwedssd', 8) + "!");
console.log(">>   Тинькофф банк: " + bankUtils.getShortName('Тинькофф банк', 8) + "!");