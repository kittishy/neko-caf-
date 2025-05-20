import { Client } from "discord.js";

// Importa as funções do sistema de tickets
// Como estamos usando ESM no TypeScript e CommonJS no JavaScript, precisamos fazer uma importação dinâmica
let ticketSystem: any;

// Carrega o sistema de tickets
// Função para carregar o sistema de tickets e iniciar verificações periódicas
export async function loadTicketSystem(client: Client) {
  try {
    // Importa o sistema de tickets usando require() em um contexto ESM
    ticketSystem = await import("../../../commands/moderacao/tickets.js") as typeof tickets;
    console.log("[TicketSystem] Sistema de tickets carregado com sucesso!");

    // Inicia a verificação periódica de tickets inativos (a cada 6 horas)
    setInterval(() => {
      ticketSystem.default.verificarTicketsInativos(client);
    }, 6 * 60 * 60 * 1000);

    // Executa uma verificação inicial
    ticketSystem.default.verificarTicketsInativos(client);
  } catch (error) {
    console.error("[TicketSystem] Erro ao carregar o sistema de tickets:", error);
  }
}
declare const tickets: {
  verificarTicketsInativos: (client: import("discord.js").Client) => Promise<void>;
  // Adicione aqui outras funções exportadas por tickets.js, se houver
};

export default tickets;