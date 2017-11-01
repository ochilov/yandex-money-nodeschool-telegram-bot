const config = require('config'); 

// библиотека для работы с ботом
const Telegraf = require('telegraf')
const Extra = require('telegraf/lib/helpers/extra')
const Markup = require('telegraf/lib/helpers/markup')

const BOT_TOKEN = config.get('token')

const bot = new Telegraf(BOT_TOKEN)

//bot.use(Telegraf.log())

bot.command('menu', ({reply}) => {
	reply('Menu', Markup
		.keyboard([
			['Карты', 'Перевести']
		])
		.oneTime()
		.resize()
		.extra()
	)
});

bot.hears('Карты', ctx => ctx.reply('Free hugs. Call now!'))

bot.command('onetime', ({ reply }) =>
  reply('One time keyboard', Markup
    .keyboard(['/simple', '/inline', '/pyramid'])
    .oneTime()
    .resize()
    .extra()
  )
)

bot.command('custom', ({ reply }) => {
	return reply('Custom buttons keyboard', Markup.
		keyboard([
			['🔍 Search', '😎 Popular'], // Row1 with 2 buttons
			['☸ Setting', '📞 Feedback'], // Row2 with 2 buttons
			['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
		])
		.oneTime()
		.resize()
		.extra()
	)
})


bot.command('special', (ctx) => {
  return ctx.reply('Special buttons keyboard', Extra.markup((markup) => {
    return markup.resize()
      .keyboard([
        markup.contactRequestButton('Send contact'),
        markup.locationRequestButton('Send location')
      ])
  }))
})

bot.hears('🔍 Search', ctx => ctx.reply('Yay!'))
bot.hears('📢 Ads', ctx => ctx.reply('Free hugs. Call now!'))


bot.command('pyramid', (ctx) => {
  return ctx.reply('Keyboard wrap', Extra.markup(
    Markup.keyboard(['one', 'two', 'three', 'four', 'five', 'six'], {
      wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2
    })
  ))
})

bot.command('simple', (ctx) => {
  return ctx.replyWithHTML('<b>Coke</b> or <i>Pepsi?</i>', Extra.markup(
    Markup.keyboard(['Coke', 'Pepsi'])
  ))
})

bot.command('inline', (ctx) => {
  return ctx.reply('<b>Coke</b> or <i>Pepsi?</i>', Extra.HTML().markup((m) =>
    m.inlineKeyboard([
      m.callbackButton('Coke', 'Coke'),
      m.callbackButton('Pepsi', 'Pepsi')
    ])))
})

bot.command('random', (ctx) => {
  return ctx.reply('random example',
    Markup.inlineKeyboard([
      Markup.callbackButton('Coke', 'Coke'),
      Markup.callbackButton('Dr Pepper', 'Dr Pepper', Math.random() > 0.5),
      Markup.callbackButton('Pepsi', 'Pepsi')
    ]).extra()
  )
})

bot.hears(/\/wrap (\d+)/, (ctx) => {
  return ctx.reply('Keyboard wrap', Extra.markup(
    Markup.keyboard(['one', 'two', 'three', 'four', 'five', 'six'], {
      columns: parseInt(ctx.match[1])
    })
  ))
})

bot.action('Dr Pepper', (ctx, next) => {
	console.log('action:Dr Pepper');
  return ctx.reply('👍').then(next)
})

bot.action(/.+/, (ctx) => {
  return ctx.answerCallbackQuery(`Oh, ${ctx.match[0]}! Great choise`)
})

bot.startPolling()

/*
const bot = new TelegramBot(TOKEN, {polling:true});
let chatId = -1;
// успешная авторизация
bot.getMe().then(me => {
	console.log('Login', me.username);
	//chatId = me.chat.id;
});

bot.on('message', msg => {
	const { chat:{id} } = msg;
	chatId = id;
	bot.sendMessage(id, 'Pong');
bot.sendMessage(id, 'language?',opt);
});

const opt = {
	parse_mode: 'markdown',
	disable_web_page_preview: false,
	reply_markup: JSON.stringify({
		inline_keyboard: [[
			{text: `Русский ${'ru'}`, callback_data:'rus'},
			{text: `English ${'gb'}`, callback_data:'eng'}
		]]
   })
}
*/