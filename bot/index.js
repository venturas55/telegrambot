import 'dotenv/config';
import fs from 'fs';
import dayjs from 'dayjs';
import 'dayjs/locale/es.js';
import moment from 'moment';

import { initTelegram } from './services/telegram.js';
import {
  USERS_PERMITIDOS,
  ADMIN_ID,
  DIAS_VALIDOS,
  PLAYAS_VALIDAS
} from './config.js';

import { normalizar, parseInput } from './utils.js';

dayjs.locale('es');

const BOT_TOKEN = process.env.BOT_TOKEN;
const MY_CHAT_ID = process.env.MY_CHAT_ID;

const bot = initTelegram(BOT_TOKEN);
let fechahora = moment(Date.now()).format("L LTS");
// Estado simple por usuario
const estadoUsuarios = {};

// ======================
// 🧾 MENSAJES
// ======================

const HELP = `
🤖 Comandos disponibles:

/playa → Elegir con botones
/help → Muestra esta ayuda

También puedes escribir:
\n\t\t 👉 <Playa> <Día>\n\nEjemplo:\n\t\t👉 Mareny hoy
`;

// ======================
// 🔐 VALIDACIÓN
// ======================

const autorizado = (id) => USERS_PERMITIDOS.includes(id);

const validar = (playa, dia) => {
  if (!PLAYAS_VALIDAS.includes(playa)) {
    return `❌ La playa 🏖️ debe ser una de las siguientes:\n\tPeñíscola\n\tCastellon\n\tBurriana\n\tCanet\n\tPort saplaya\n\tSaler\n\tMareny\n\tOliva\n\tMolins\n\tAltea\n\tVillajoyosa\n\tSanta pola\n\tLos narejos`;
  }
  if (!DIAS_VALIDOS.includes(dia)) {
    return `❌ La segunda palabra debe ser el día deseado:\n\t${playa} ayer\n\t${playa} hoy\n\t${playa} mañana`;
  }
  return null;
};

// ======================
// 🎯 ACCIÓN PRINCIPAL
// ======================

const procesarPeticion = (chatId, user, playa, dia) => {
  const error = validar(playa, dia);
  if (error) {
    bot.sendMessage(chatId, error);
    return;
  }
  const mensaje = `Ponla|${user}|${chatId}|${playa} ${dia}`;
  bot.sendMessage(MY_CHAT_ID, mensaje);

  bot.sendMessage(chatId, `⏳ Procesando...`);
};

// ======================
// ⌨️ BOTONES
// ======================

const mostrarPlayas = (chatId) => {
  bot.sendMessage(chatId, "🏖️ Elige una playa:", {
    reply_markup: {
      inline_keyboard: PLAYAS_VALIDAS.map(p => [
        { text: p, callback_data: `playa:${p}` }
      ])
    }
  });
};

// ======================
// 💬 MENSAJES
// ======================

bot.on('message', (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const user = msg.from.username || msg.from.first_name || "user";

  const texto = normalizar(msg.text || "");

  console.log(`[${fechahora}] \t ${user} (${chatId}) envió\t ${texto}`);


  if (!autorizado(userId)) {
    bot.sendMessage(chatId, "❌ No autorizado");
    return;
  }

  // ===== comandos =====




  if (texto === "/start" || texto === "/help") {
    bot.sendMessage(chatId, HELP);
    return;
  }

  if (texto === "/playa") {
    mostrarPlayas(chatId);
    return;
  }


  if (texto === "log") {
    if (chatId != ADMIN_ID) {
      bot.sendMessage(chatId, "No tienes permiso para ver logs ❌");
      return;
    }

    fs.readFile(ruta, 'utf8', (err, data) => {
      if (err) {
        bot.sendMessage(chatId, "Error leyendo logs ❌");
        return;
      }

      bot.sendMessage(chatId, `🤖 Logs:\n${data.slice(-300)}`);
    });

    return;
  }

  // ===== texto libre =====

  const parsed = parseInput(texto);
  if (!parsed) {
    bot.sendMessage(chatId, HELP);
    return;
  }

  procesarPeticion(chatId, user, parsed.playa.toLowerCase(), parsed.dia.toLowerCase());
});

// ======================
// 🔘 CALLBACK BOTONES
// ======================

bot.on('callback_query', (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  //console.log(query);

  if (!autorizado(userId)) return;

  if (data.startsWith("playa:")) {
    const playa = data.split(":")[1];

    estadoUsuarios[userId] = { playa };

    bot.editMessageText(`🏖️ Playa: ${playa}\nAhora elige día:`, {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: {
        inline_keyboard: DIAS_VALIDOS.map(d => [
          { text: d, callback_data: `dia:${d}` }
        ])
      }
    });
  }

  if (data.startsWith("dia:")) {
    const dia = data.split(":")[1];
    const estado = estadoUsuarios[userId];

    if (!estado?.playa) {
      bot.sendMessage(chatId, "❌ Primero elige playa");
      return;
    }

    const playa = estado.playa;

    // 👉 Ejecutar lógica
    procesarPeticion(chatId, query.from.first_name + " " + query.from.last_name, playa, dia);

    // 👉 EDITAR el mensaje y quitar botones
    bot.editMessageText(
      `✅ Pedido enviado\n\n🏖️ Playa: ${playa}\n📅 Día: ${dia}`,
      {
        chat_id: chatId,
        message_id: query.message.message_id
        // ❌ NO reply_markup → elimina botones
      }
    );

    delete estadoUsuarios[userId];
  }

  bot.answerCallbackQuery(query.id);
});

// ======================
// 🚀 INIT
// ======================

bot.sendMessage(MY_CHAT_ID, "🤖 Bot iniciado");