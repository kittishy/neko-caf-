// Integração modular com a API da Loritta para comandos de utilidades
import axios from 'axios';

const LORITTA_API_KEY = process.env.LORITTA_API_KEY || 'lorixp_6y3jWw69toqTPWNvyyYYokFTJ8kwuwSnoXxx3juNLKXn';
const LORITTA_API_BASE = 'https://api.loritta.dev/v1';

function logLoritta(action, data) {
  console.log(`[Loritta][Utilidades] ${action}:`, data);
}

// Exemplo de comando utilitário: obter informações do servidor
async function getServerInfo(serverId) {
  try {
    const response = await axios.get(
      `${LORITTA_API_BASE}/utils/serverinfo`,
      { headers: { 'Authorization': `Bearer ${LORITTA_API_KEY}` }, params: { serverId } }
    );
    logLoritta('Informações do servidor recebidas', { serverId, info: response.data });
    return response.data;
  } catch (error) {
    logLoritta('Erro ao buscar informações do servidor', error.response?.data || error.message);
    throw error;
  }
}

export { getServerInfo };