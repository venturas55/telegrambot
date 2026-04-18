import 'dotenv/config';

import { initTelegram } from './services/telegram.js';
const USERS_PERMITIDOS = [8406513586];

const BOT_TOKEN = process.env.BOT_TOKEN;
const MY_CHAT_ID = process.env.MY_CHAT_ID;
console.log("TOKEN:", process.env.BOT_TOKEN);
const bot = initTelegram(BOT_TOKEN);

// Evento principal: cuando alguien escribe al bot
bot.on('message', (msg) => {
    const user = msg.from.username || msg.from.first_name || "desconocido";
    try {
        if (!USERS_PERMITIDOS.includes(msg.from.id)) {
            bot.sendMessage(msg.chat.id, "❌ No autorizado. Paga Judio");
            return;
        }

        let texto = "(no es texto)";
        if (msg.text) texto = msg.text;
        else if (msg.photo) texto = "📷 Foto";
        else if (msg.voice) texto = "🎤 Audio";
        else if (msg.sticker) texto = "😄 Sticker";

        let mensaje = `${user}|${msg.from.id}|${msg.chat.id}|${texto}`;
        console.log(mensaje);
        mensaje="Ponla "+mensaje;
        bot.sendMessage(process.env.MY_CHAT_ID, mensaje)
            .catch(console.error);

        bot.sendMessage(msg.chat.id, "✅ Comando enviado");

    } catch (error) {
        console.error("Error:", error);
    }
});

// Mensaje al arrancar
bot.sendMessage(MY_CHAT_ID, "🤖 Bot iniciado correctamente");