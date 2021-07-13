import TelegramBot, {Message} from "node-telegram-bot-api";
import {toOldRedditJsonUrl} from "./reddit";
import {URL} from "url";
import got from "got";

import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const token = process.env.BOT_TOKEN ?? '';
const channelChatId = Number(process.env.CHANNEL_CHAT_ID);
// Create a bot that uses polling to fetch new updates
const bot = new TelegramBot(token, {polling: false});

async function loadJsonFromUrl(url: string): Promise<any> {
    const response = await got(url);
    return JSON.parse(response.body);
}

async function loadBufferFromUrl(url: string): Promise<Buffer> {
    const response = await got(url, { responseType: 'buffer' });
    return response.body;
}

bot.onText(/^https:\/\/www\.reddit\.com\/r.*$/g, async (message: Message, match: RegExpExecArray | null) => {
    if (message.text != null) {
        const jsonUrl = toOldRedditJsonUrl(new URL(message.text));
        const redditResult = await loadJsonFromUrl(jsonUrl.toString());
        const imgUrl = redditResult[0].data.children[0].data.url;
        const title = redditResult[0].data.children[0].data.title;
        const buffer = await loadBufferFromUrl(imgUrl);
        bot.sendPhoto(channelChatId, buffer, {caption: title + '\n' + message.text});
    }
});

bot.on('photo', async (message, metadata) => {
    if (!message.from?.is_bot) {
        if (message.photo !== undefined) {
            const photo = message.photo.pop();
            if (message.from?.id !== undefined && photo !== undefined) {
                bot.sendPhoto(channelChatId, photo.file_id);
            }
        }
    }
});

const whenUpdates = bot.getUpdates();
let lastOffset = 0;

(async () => {
    await whenUpdates.then(
        async updates => {
            await Promise.all(updates.map(async update => {
                    console.log(update);
                    if (update.update_id > lastOffset) {
                        lastOffset = update.update_id;
                    }
                    bot.processUpdate(update)
                })
            );
        }
    );

    // clear queue
    bot.getUpdates({offset: lastOffset + 1});
})();
