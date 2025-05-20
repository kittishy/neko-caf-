import { Client, Events, Interaction, Message } from "discord.js";
import { db } from "#database";

// Importa as funções do sistema de tickets
// Como estamos usando ESM no TypeScript e CommonJS no JavaScript, precisamos fazer uma importação dinâmica
let ticketSystem: any;

// Carrega o sistema de tickets
async function loadTicketSystem(client: Client) {
  try {
    // Importa o sistema de tickets usando require() em um contexto ESM
    ticketSystem = await import("../../../commands/moderacao/tickets.js");
    console.log("[TicketSystem] Sistema de tickets carregado com sucesso!");

    // Inicia a verificação periódica de tickets inativos (a cada 6 horas)
    setInterval(() => {
      ticketSystem.verificarTicketsInativos(client);
    }, 6 * 60 * 60 * 1000);

    // Executa uma verificação inicial
    ticketSystem.verificarTicketsInativos(client);
  } catch (error) {
    console.error("[TicketSystem] Erro ao carregar o sistema de tickets:", error);
  }
}

// Adicione a declaração de módulo para o JS import
declare module "../../../commands/moderacao/ticketCommand.js" {
  const value: any;
  export default value;
}

export default (client: Client) => {
  client.once(Events.ClientReady, async () => {
    await loadTicketSystem(client);
  });

  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    // Não processa se o sistema de tickets não estiver carregado
    if (!ticketSystem) {
      return;
    }

    try {
      // Processa interações de botão
      if (interaction.isButton() && interaction.customId.startsWith('ticket_')) {
        const ticketCommand = await import("../../../commands/moderacao/ticketCommand.js");
        await ticketCommand.default.handleButton(interaction);
      }

      // Processa interações de modal
      if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_')) {
        const ticketCommand = await import("../../../commands/moderacao/ticketCommand.js");
        await ticketCommand.default.handleModal(interaction);
      }
    } catch (error) {
      console.error("[TicketSystem] Erro ao processar interação:", error);

      // Responde ao usuário se ainda não tiver respondido
      if (
        (interaction.isButton() || interaction.isModalSubmit()) &&
        !(interaction as any).replied &&
        !(interaction as any).deferred
      ) {
        await (interaction as any).reply?.({
          content: "Ocorreu um erro ao processar sua solicitação.",
          ephemeral: true
        }).catch(() => {});
      }
    }
  });

  // Registra o evento de mensagem para atualizar a atividade dos tickets
  client.on(Events.MessageCreate, async (message: Message) => {
    // Não processa se o sistema de tickets não estiver carregado
    if (!ticketSystem || message.author.bot) {
      return;
    }

    try {
      // Verifica se a mensagem é de um canal de ticket
      const ticket = await db.tickets.findOne({
        channelId: message.channelId,
        status: "open"
      });

      if (ticket) {
        // Registra a mensagem e atualiza a última atividade
        const ticketCommand = await import("../../../commands/moderacao/ticketCommand.js");
        await ticketCommand.default.handleMessage(message);
      }
    } catch (error) {
      console.error("[TicketSystem] Erro ao processar mensagem:", error);
    }
  });
};