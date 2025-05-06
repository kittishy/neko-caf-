// Integração modular com a API da Loritta para comandos de moderação
const axios = require('axios');

const LORITTA_API_KEY = process.env.LORITTA_API_KEY || 'lorixp_6y3jWw69toqTPWNvyyYYokFTJ8kwuwSnoXxx3juNLKXn';
const LORITTA_API_BASE = 'https://api.loritta.dev/v1';

function logLoritta(action, data) {
  console.log(`[Loritta][Moderação] ${action}:`, data);
}

async function banUser(serverId, userId, reason = '') {
  try {
    const response = await axios.post(
      `${LORITTA_API_BASE}/moderation/ban`,
      { serverId, userId, reason },
      { headers: { 'Authorization': `Bearer ${LORITTA_API_KEY}` } }
    );
    logLoritta('Usuário banido', { serverId, userId, reason });
    return response.data;
  } catch (error) {
    logLoritta('Erro ao banir usuário', error.response?.data || error.message);
    throw error;
  }
}

async function kickUser(serverId, userId, reason = '') {
  try {
    const response = await axios.post(
      `${LORITTA_API_BASE}/moderation/kick`,
      { serverId, userId, reason },
      { headers: { 'Authorization': `Bearer ${LORITTA_API_KEY}` } }
    );
    logLoritta('Usuário expulso', { serverId, userId, reason });
    return response.data;
  } catch (error) {
    logLoritta('Erro ao expulsar usuário', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  banUser,
  kickUser
};