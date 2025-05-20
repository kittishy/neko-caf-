// Integração modular com a API da Loritta para comandos de diversão
import axios from 'axios';

const LORITTA_API_KEY = process.env.LORITTA_API_KEY || 'lorixp_6y3jWw69toqTPWNvyyYYokFTJ8kwuwSnoXxx3juNLKXn';
const LORITTA_API_BASE = 'https://api.loritta.dev/v1';

function logLoritta(action, data) {
  console.log(`[Loritta][Diversão] ${action}:`, data);
}

async function joke(serverId) {
  try {
    const response = await axios.get(
      `${LORITTA_API_BASE}/fun/joke`,
      { headers: { 'Authorization': `Bearer ${LORITTA_API_KEY}` }, params: { serverId } }
    );
    logLoritta('Piada recebida', { serverId, joke: response.data });
    return response.data;
  } catch (error) {
    logLoritta('Erro ao buscar piada', error.response?.data || error.message);
    throw error;
  }
}

export {
  joke
};