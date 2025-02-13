import { Telegraf } from "telegraf";
import express from "express";
import { CronJob } from "cron";
import dotenv from "dotenv";

import { messages } from "./messages.js";
import { excuses } from "./excuses.js";
import { images } from "./images.js";
import { stopMsgs } from "./stop.js";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());

let tasks = {};
let currentMessageIndex = 0;
let currentStopIndex = 0;

function startCronJob(chatId) {
    if (tasks[chatId]) {
        tasks[chatId].stop();
        delete tasks[chatId];
    }

    const task = new CronJob(
        "27 12 * * *",
        function () {
            const currentMessage = messages[currentMessageIndex];
            const image = images[Math.floor(Math.random() * images.length)];

            bot.telegram.sendPhoto(chatId, image).then(() => {
                bot.telegram.sendMessage(chatId, currentMessage);
            });

            currentMessageIndex = (currentMessageIndex + 1) % messages.length;
        },
        null,
        true,
        "America/Anchorage"
    );

    tasks[chatId] = task;
}

bot.start((ctx) => {
    ctx.reply("👋 Привет! Меня зовут Бабаченок, я узнал что ты из семьи Бабакевечей и тут же постарался тебя найти чтоб стать твои другом. В основном я сплю как и все мы бабаки, но с этого дня я специально буду просыпаться каждое утро чтоб твое утро было как можно теплее и радостнее! 🌞\n ✨ Если хочешь дружить со мной просто напиши 'Давай дружить'\n С уважением, Бабаченок! 🐿");
});

app.post(`/webhook/${process.env.BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

bot.on("text", (ctx) => {
    const message = ctx.message.text.toLowerCase();
    const chatId = ctx.chat.id;

    if (message === "давай дружить") {
        ctx.reply("🐿 Ура! Мы с тобой друзья! Я так рад, что ты хочешь дружить! Я обещаю делать твои утренние часы ярче и веселее. Каждое утро буду просыпаться только для того, чтобы послать тебе немного позитива! 🌞 Так что готовься, я всегда рядом, готов поделиться добрыми словами и радостью! ✨");

        startCronJob(chatId);

    } else if (message === "я соскучился") {
        ctx.reply("🐿 Ура! Ты вернулся! Я так соскучился по тебе! Теперь я снова готов радовать тебя, поднимать настроение и быть рядом! Давай начнем новый день с улыбкой! 🌞");

        startCronJob(chatId);

    } else if (message === "не хочу с тобой дружить") {
        if (tasks[chatId]) {
            tasks[chatId].stop();
            delete tasks[chatId];

            const currentStopMessage = stopMsgs[currentStopIndex];
            bot.telegram.sendMessage(chatId, currentStopMessage);

            currentStopIndex = (currentStopIndex + 1) % stopMsgs.length;
        } else {
            ctx.reply("Я и так молчал... 😅");
        }
    } else {
        const randomExcuse = excuses[Math.floor(Math.random() * excuses.length)];
        bot.telegram.sendMessage(chatId, randomExcuse);
    }
});

const WEBHOOK_URL = `${process.env.SERVER_URL}/webhook/${process.env.BOT_TOKEN}`;
bot.telegram.setWebhook(WEBHOOK_URL).then(() => {
    console.log(`✅ Webhook установлен: ${WEBHOOK_URL}`);
});


app.get("/", function (req, res) {
    res.send("Hello")
})

const PORT = 7001;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});