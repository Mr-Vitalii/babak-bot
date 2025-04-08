import { Telegraf } from "telegraf";
import express from "express";
import { CronJob } from "cron";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { messages } from "./messages.js";
import { excuses } from "./excuses.js";
import { images } from "./images.js";
import { stopMsgs } from "./stop.js";

import { User } from "./models/User.js";
import { CronTask } from "./models/CronTask.js";

dotenv.config();

async function restoreCronJobs() {
    const activeTasks = await CronTask.find({});
    activeTasks.forEach((task) => {
        startCronJob(task.chatId);
    });
}

async function updateCronJobs() {
    const activeTasks = await CronTask.find({});
    activeTasks.forEach(async (task) => {

        if (task) {

            if (task.job) {
                task.job.stop();
            }

            const newJob = new CronJob(
                "30 5 * * *",
                async function () {
                    const currentMessage = messages[task.messageIndex];
                    const image = images[Math.floor(Math.random() * images.length)];
                    await bot.telegram.sendPhoto(task.chatId, image);
                    await bot.telegram.sendMessage(task.chatId, currentMessage);

                    task.messageIndex = (task.messageIndex + 1) % messages.length;
                    await task.save();
                },
                null,
                true,
                "America/Anchorage"
            );

            task.job = newJob;
            await task.save();
        }
    });
}

mongoose
    .connect(process.env.DB_HOST)
    .then(() => {
        console.log("Connected to database!");

        updateCronJobs();
    })
    .catch((err) => {
        console.error("Error connecting to the database:", err);
    });

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());

let task;

async function startCronJob(chatId) {
    let existingTask = await CronTask.findOne({ chatId });

    if (!existingTask) {
        existingTask = new CronTask({ chatId, messageIndex: 0 });
        await existingTask.save();
    }

    if (task) {
        task.stop();
        task = null;
    }


    task = new CronJob(
        "30 5 * * *",
        async function () {

            existingTask = await CronTask.findOne({ chatId });

            if (!existingTask) return;

            const currentMessage = messages[existingTask.messageIndex];
            const image = images[Math.floor(Math.random() * images.length)];

            await bot.telegram.sendPhoto(chatId, image);
            await bot.telegram.sendMessage(chatId, currentMessage);

            existingTask.messageIndex = (existingTask.messageIndex + 1) % messages.length;

            if (existingTask) {
                await existingTask.save();
            }
        },
        null,
        true,
        "America/Anchorage"
    );
}

bot.start((ctx) => {
    ctx.reply("👋 Привет! Меня зовут Бабаченок, я узнал что ты из семьи Бабакевечей и тут же постарался тебя найти чтоб стать твои другом. В основном я сплю как и все мы бабаки, но с этого дня я специально буду просыпаться каждое утро чтоб твое утро было как можно теплее и радостнее! 🌞\n ✨ Если хочешь дружить со мной просто напиши 'Давай дружить'\n С уважением, Бабаченок! 🐿");
});

app.post(`/webhook/${process.env.BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

bot.on("text", async (ctx) => {
    const message = ctx.message.text.toLowerCase();
    const chatId = ctx.chat.id;

    if (message === "давай дружить") {
        ctx.reply("🐿 Ура!! Мы с тобой друзья! Я так рад, что ты хочешь дружить! Я обещаю делать твои утренние часы ярче и веселее. Каждое утро буду просыпаться только для того, чтобы послать тебе немного позитива! 🌞 Так что готовься, я всегда рядом, готов поделиться добрыми словами и радостью! ✨");

        const existingUser = await User.findOne({ chatId });
        if (!existingUser) {
            await new User({ chatId }).save();
        }

        startCronJob(chatId);

    } else if (message === "я соскучился") {
        ctx.reply("🐿 Ура! Ты вернулся! Я так соскучился по тебе! Теперь я снова готов радовать тебя, поднимать настроение и быть рядом! Давай начнем новый день с улыбкой! 🌞");

        startCronJob(chatId);

    } else if (message === "не хочу с тобой дружить") {
        const existingTask = await CronTask.findOne({ chatId });
        if (existingTask) {
            await CronTask.deleteOne({ chatId });
            if (task) {
                task.stop();
                task = null;
            }
            ctx.reply(stopMsgs[Math.floor(Math.random() * stopMsgs.length)]);

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