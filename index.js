import 'dotenv/config';
import moment from 'moment';
import { initTelegram } from './services/telegram.js';

moment.locale("es");

const USERS_PERMITIDOS = [8406513586, 8277408556, 8718113457];

const BOT_TOKEN = process.env.BOT_TOKEN;
const MY_CHAT_ID = process.env.MY_CHAT_ID;
const bot = initTelegram(BOT_TOKEN);
const DIAS_VALIDOS = ["ayer", "hoy", "mañana"];
const PLAYAS_VALIDAS = ["peñiscola","castellon","burriana","canet","portsa","saler","mareny","oliva","molins","altea","villajoyosa","santa pola","los narejos"];


// Evento principal: cuando alguien escribe al bot
bot.on('message', (msg) => {
    const user = msg.from.username || msg.from.first_name || "desconocido";
    console.log(`[${moment(Date.now()).format("LLL")}] \t ${user} envió ${msg.text}`)
    try {
        if (!USERS_PERMITIDOS.includes(msg.from.id)) {
            bot.sendMessage(msg.chat.id, `
                ❌ ${user} no estás autorizado. \n
                Paga Judio.\n
                Facilitale tu id ${msg.from.id} al administradorsh
                `);
            return;
        }

        let texto = msg.text.trim();
        if (!msg.text) {
            bot.sendMessage(msg.chat.id, "Solo entiendo texto ❌ \n Usa <Playa Día> por ej:\n\t\t Mareny hoy");
            return;
        }

        if(texto.toLowerCase()=="log"){
            bot.sendMessage(8406513586, "🤖 Logs:");
        }


        const partes = texto.split(" ");
        if (partes.length < 2) {
            bot.sendMessage(msg.chat.id, "Formato incorrecto ❌ \n Usa <Playa Día> por ej:\n\t\t Mareny hoy");
            return;
        }

        const dia = partes.pop().toLowerCase(); // última palabra
        const playa = partes.join(" ").toLowerCase();;         // resto

        if (!PLAYAS_VALIDAS.includes(playa)) {
            bot.sendMessage(msg.chat.id, `La primera palabra debe una de las siguientes playas:\n\tPeñiscola\n\tCastellon\n\tBurriana\n\tCanet\n\tPortsa\n\tSaler\n\tMareny\n\tOliva\n\tMolins\n\tAltea\n\tVillajoyosa\n\tSanta pola\n\tLos narejos`);
            return;
        }

        
        if (!DIAS_VALIDOS.includes(dia)) {
            bot.sendMessage(msg.chat.id, `La segunda palabra debe ser el día deseado:\n\t${playa} ayer\n\t${playa} hoy\n\t${playa} mañana`);
            return;
        }


        let mensaje = `${user}|${msg.from.id}|${msg.chat.id}|${texto}`;
        mensaje = "Ponla " + mensaje;
        bot.sendMessage(MY_CHAT_ID, mensaje)
            .catch(console.error);

        bot.sendMessage(msg.chat.id, "✅ Comando enviado. Procesando...");

    } catch (error) {
        console.error("Error:", error);
    }
});

// Mensaje al arrancar
bot.sendMessage(MY_CHAT_ID, "🤖 Bot iniciado correctamente");