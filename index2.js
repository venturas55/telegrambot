import 'dotenv/config';



import { initTelegram } from './services/telegram.js';
const USERS_PERMITIDOS = [8406513586, 8277408556, 8718113457];

const BOT_TOKEN = process.env.BOT_TOKEN;
const MY_CHAT_ID = process.env.MY_CHAT_ID;
//console.log("TOKEN:", process.env.BOT_TOKEN);
const bot = initTelegram(BOT_TOKEN);
const DIAS_VALIDOS = ["ayer", "hoy", "mañana"];


// Evento principal: cuando alguien escribe al bot
bot.on('message', (msg) => {
    const user = msg.from.username || msg.from.first_name || "desconocido";

    try {
        if (!USERS_PERMITIDOS.includes(msg.from.id)) {
            bot.sendMessage(msg.chat.id, `
                ❌ ${user} no estás autorizado. 
                Paga Judio.
                Facilitale tu id ${msg.from.id} al administradorsh
                `);

            return;
        }

        if (!msg.text) {
            bot.sendMessage(msg.chat.id, "Formato incorrecto. Usa: Playa Día (ej: Mareny Hoy)");
            return;
        }

        const texto = msg.text.trim();

        const regex = /^(.+)\s+(ayer|hoy|mañana)$/i;
        const match = texto.match(regex);

        if (!match) {
            bot.sendMessage(msg.chat.id, "Formato incorrecto. Usa: Playa Día (ej: Mareny Hoy)");
            return;
        }

        const playa = match[1];
        const dia = match[2].toLowerCase();

        let mensaje = `${user}|${msg.from.id}|${msg.chat.id}|${playa}|${dia}`;
        console.log(mensaje);

        bot.sendMessage(MY_CHAT_ID, "Ponla " + mensaje)
            .catch(console.error);

        bot.sendMessage(msg.chat.id, "✅ Comando enviado");

    } catch (error) {
        console.error("Error:", error);
    }
});
// Mensaje al arrancar
bot.sendMessage(MY_CHAT_ID, "🤖 Bot iniciado correctamente");