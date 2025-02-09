import { Telegraf } from "telegraf";
import express from "express";
import cron from "node-cron";
import dotenv from "dotenv";

import { messages } from "./messages.js";
import { excuses } from "./excuses.js";
import { images } from "./images.js";
import { stopMsgs } from "./stop.js";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());

let task = null;
let currentMessageIndex = 0;
let currentStopIndex = 0;

bot.start((ctx) => ctx.reply('👋 Привет! Меня зовут Бабаченок, я узнал что ты из семьи Бабакевечей и тут же постарался тебя найти чтоб стать твои другом. В основном я сплю как и все мы бабаки, но с этого дня я специально буду просыпаться каждое утро чтоб твое утро было как можно теплее и радостнее! 🌞\n ✨ Если хочешь дружить со мной просто напиши "Давай дружить"\n С уважением, твой друг Бабаченок! 🐿'));


app.post(`/webhook/${process.env.BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

bot.on("text", (ctx) => {
    const message = ctx.message.text.toLowerCase();

    if (message === "давай дружить") {
        ctx.reply("🐿 Ура! Мы с тобой друзья! Я так рад, что ты хочешь дружить! Я обещаю делать твои утренние часы ярче и веселее. Каждое утро буду просыпаться только для того, чтобы послать тебе немного позитива! 🌞 Так что готовься, я всегда рядом, готов поделиться добрыми словами и радостью! ✨");

        if (task) task.stop();

        task = cron.schedule("*/1 * * * *", () => {
            const currentMessage = messages[currentMessageIndex];
            const image = images[Math.floor(Math.random() * images.length)];

            bot.telegram.sendPhoto(ctx.chat.id, image).then(() => {
                bot.telegram.sendMessage(ctx.chat.id, currentMessage);
            });

            currentMessageIndex = (currentMessageIndex + 1) % messages.length;
        });

        task.start();

    } else if (message === "я соскучился") {
        ctx.reply("🐿 Ура! Ты вернулся! Я так соскучился по тебе! Теперь я снова готов радовать тебя, поднимать настроение и быть рядом! Давай начнем новый день с улыбкой! 🌞");

        if (task) task.stop();

        task = cron.schedule("*/1 * * * *", () => {
            const currentMessage = messages[Math.floor(Math.random() * messages.length)];
            const image = images[Math.floor(Math.random() * images.length)];

            bot.telegram.sendPhoto(ctx.chat.id, image).then(() => {
                bot.telegram.sendMessage(ctx.chat.id, currentMessage);
            });
        });

        task.start();

    } else if (message === "стоп") {
        if (task) {
            task.stop();
            task = null;

            const currentStopMessage = stopMsgs[currentStopIndex];
            bot.telegram.sendMessage(ctx.chat.id, currentStopMessage);

            currentStopIndex = (currentStopIndex + 1) % stopMsgs.length;
        } else {
            ctx.reply("Я и так молчал... 😅");
        }
    } else {
        const randomExcuse = excuses[Math.floor(Math.random() * excuses.length)];
        bot.telegram.sendMessage(ctx.chat.id, randomExcuse);
    }
});


const WEBHOOK_URL = `${process.env.SERVER_URL}/webhook/${process.env.BOT_TOKEN}`;
bot.telegram.setWebhook(WEBHOOK_URL).then(() => {
    console.log(`✅ Webhook установлен: ${WEBHOOK_URL}`);
});


const PORT = 7001;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});