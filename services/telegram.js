import TelegramBot from 'node-telegram-bot-api';

let bot;

export function initTelegram(token) {
  bot = new TelegramBot(token, { polling: true });
  return bot;
}

export function getBot() {
  return bot;
}