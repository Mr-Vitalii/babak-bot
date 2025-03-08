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
                "53 5 * * *",
                async function () {

                    const currentMessage = "🌞 Доброе и чудесное утречко! Вставай, принцесса👸, сегодня твой день, день самой прекрасной бабаченки на земле! С праздничком тебя! Пользуясь случаем торжественного дня, я хотел бы рассказать тебе историю о том, что сподвигло меня найти тебя… 🌳✨ Однажды, в одном чудесном лесу, где деревья шепчут сказки, а реки поют колыбельные, жила большая и дружная семья бабаков — Бабакевичи. Их норка была самой уютной во всем лесу: 🏡 стены украшены мхом, на полках стояли баночки с медом 🍯 и ягодами 🍓, а у очага всегда потрескивали дрова, наполняя дом теплым светом. 🐿 У Бабакевичей долго не было детей. Но древняя легенда, хранящаяся в старом дупле Древа Мудрости 🌿📜, гласила: однажды в семье бабаков родится девочка с глазами цвета лесной зелени 🍀 — и это будет настоящее чудо. Она принесет в мир свет, добро и гармонию 💖, а её сердце будет столь чистым, что само солнце ☀️ захочет согревать её путь. 🌼 И вот в один весенний денек в семье Бабакевичей случилось великое событие — родилась маленькая бабаченка, которую назвали Бабаченушкой. Все лесные звери пришли поздравить родителей 🦊🦉🐰, и даже сама Лесная Фея послала лучик солнца, чтобы согреть крошечную лапку новорожденной. 🍃 Когда Бабаченушка родилась и открыла свои яркие, изумрудные глазки, стало ясно — пророчество сбылось. Чтобы укрепить в ней все заложенные природой дары, её нужно было искупать в волшебной ванночке. 🛁 Отец семейства, Бабак Лесович, приготовил дубовую купель 🌳 и наполнил её прозрачной водой из ручья. Лесная Фея добавила в воду особые ингредиенты: 🌿 Доброту, чтобы Бабаченушка всегда помогала другим. 🌟 Красоту, чтобы, глядя на неё, невозможно было отвести глаз. 🦉 Мудрость, чтобы она находила верные решения. 🍓 Изысканность, чтобы её речь и поступки были мягкими, как лепестки цветов. 🎶 Веселость, чтобы её смех звенел, словно капель весной. 🌲 Стойкость, чтобы никакие бури не сломили её дух. 🫖 Уют, чтобы рядом с ней всем было тепло и спокойно. 💖 Любовь, чтобы её сердце всегда оставалось нежным и светлым. ✨ Как только Бабаченушку опустили в волшебную ванночку, вода заискрилась, а аромат трав наполнил всю норку. Маленькая Бабаченушка заулыбалась, и тут же лес наполнился теплом, а цветы распустились! 🌸 📆 Шли годы, Бабаченушка росла, и все замечали, какой чудесной она становилась. Она умела слушать и утешать, знала все тайные тропинки леса 🌿, а её смех делал даже хмурые дни солнечными. 🏡 Однажды случилась беда: злой ветер унес у ёжика Колючки его домик из листьев 🍂. Бабаченушка, не раздумывая, собрала всех лесных друзей 🐻🐭🦔, и дружной компанией они построили ежику новый дом — ещё крепче и уютнее. С тех пор Бабаченушку стали звать Лесным Солнышком ☀️, потому что она согревала всех вокруг. ⏳ Годы шли, и Бабаченушка росла. Она стала грациозной, мудрой и ещё более доброй бабаченкой. Всякий, кто встречал её, улыбался, потому что от неё исходило особое тепло. 🚶‍♀️ Но вот настал день, когда Бабаченушке нужно было покинуть родную норку. Сердце подсказывало ей, что в большом мире есть те, кто нуждается в её помощи. — Мы всегда будем ждать тебя, милая! — кричали ей зверушки, подавая узелок с орешками и сушеными ягодами. 🌰🍇 💫 Бабаченушка простилась с семьёй и друзьями и отправилась в путь. 🏞 С тех пор в лесу о ней ходили легенды. Лесные звери передавали друг другу вести о её великих добрых делах: 🧸 “Говорят, что Бабаченушка помогла маленькому медвежонку найти дорогу домой, когда он заблудился в горах!” 🐇 “А я слышала, что она научила пугливого зайчонка быть смелым и отважным!” 💦 “А ещё она спасла пруд от засухи, разыскав волшебный источник воды!” 🦉 Всякий раз, когда в лесу кто-то попадал в беду, старый филин Книговед говорил: — Не печальтесь, друзья. Где бы ни была Бабаченушка, она обязательно найдёт способ помочь. Добро, которое мы дарим миру, всегда возвращается! 🌅 И каждый вечер, когда солнце садилось за холмы, его мягкие лучи ложились на лес так бережно, будто сама Бабаченушка присылала свой тёплый привет родному дому. 🐿 Я вырос на рассказах о тебе, — вдруг сказал маленький бабачок Шустрик, стоя перед Бабаченушкой. — Все в нашем лесу помнят Лесное Солнышко, что ушло в дальние края, чтобы нести добро. Каждый вечер, когда солнце садилось за холмы, его мягкие лучи ложились на наш лес, и все верили — ты о нас помнишь. Но мне было мало одних рассказов и солнечных лучей. Я хотел найти тебя. Хотел увидеть своими глазами ту, о ком говорят с таким восхищением. Я пересек чащи 🌲, бродил по туманным лугам 🌾, пробирался через незнакомые леса, поднимался в горы 🏔, где снег белее молока. Я спрашивал у сов, у быстрых ручьев, у звезд ✨— и все говорили одно: “Бабаченушку там, где добро и свет.” — И вот я здесь. Я нашёл тебя. И счастлив. 💖";

                    // Выбираем случайное изображение из массива images
                    const image = images[Math.floor(Math.random() * images.length)];

                    // Отправляем фото
                    await bot.telegram.sendPhoto(task.chatId, image);

                    // Функция для отправки длинного сообщения по частям
                    async function sendLongMessage(chatId, message) {
                        const maxLength = 4096; // Максимальная длина сообщения для Telegram
                        // Разбиваем сообщение на части, если оно слишком длинное
                        for (let i = 0; i < message.length; i += maxLength) {
                            const part = message.slice(i, i + maxLength);
                            await bot.telegram.sendMessage(chatId, part);
                        }
                    }

                    // Отправляем длинное сообщение по частям
                    await sendLongMessage(task.chatId, currentMessage);

                    // Обновляем индекс сообщения
                    task.messageIndex = (task.messageIndex + 1) % messages.length;
                    await task.save();
                },
                null, // Нет обратного вызова для ошибок
                true, // Запускаем задачу сразу
                "America/Anchorage" // Временная зона
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
        ctx.reply("🐿 Ура!!!! Ты вернулся! Я так соскучился по тебе! Теперь я снова готов радовать тебя, поднимать настроение и быть рядом! Давай начнем новый день с улыбкой! 🌞");

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