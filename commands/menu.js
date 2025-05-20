import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import fs from "fs";

const MENU_STATE_FILE = "./menu_state.json";
const PAGE_SIZE = 5; // Quantidade de botões por página

// Exemplo de funções (em produção, carregue dinamicamente)
const funcoes = Array.from({ length: 1000 }, (_, i) => ({
  id: `func_${i+1}`,
  nome: `Função ${i+1}`,
  categoria: `Categoria ${Math.floor(i/100)+1}`
}));

export const data = new SlashCommandBuilder()
  .setName("menu")
  .setDescription("Exibe um menu interativo com milhares de funções, com busca e paginação");

function saveMenuState(state) {
  fs.writeFileSync(MENU_STATE_FILE, JSON.stringify(state, null, 2));
}

function loadMenuState() {
  if (fs.existsSync(MENU_STATE_FILE)) {
    return JSON.parse(fs.readFileSync(MENU_STATE_FILE, "utf8"));
  }
  return null;
}

function filtrarFuncoes(query, categoria) {
  let lista = funcoes;
  if (categoria) lista = lista.filter(f => f.categoria === categoria);
  if (query) lista = lista.filter(f => f.nome.toLowerCase().includes(query.toLowerCase()));
  return lista;
}

function gerarCategorias() {
  return [...new Set(funcoes.map(f => f.categoria))];
}

function criarBotoes(funcoesPagina, paginaAtual, totalPaginas, query, categoria) {
  const botoes = funcoesPagina.map(f =>
    new ButtonBuilder()
      .setCustomId(`func_${f.id}`)
      .setLabel(f.nome.length > 80 ? f.nome.slice(0, 77) + "..." : f.nome)
      .setStyle(ButtonStyle.Primary)
  );
  // Paginação
  if (totalPaginas > 1) {
    if (paginaAtual > 0) {
      botoes.push(new ButtonBuilder().setCustomId("prev_page").setLabel("⬅️").setStyle(ButtonStyle.Secondary));
    }
    if (paginaAtual < totalPaginas - 1) {
      botoes.push(new ButtonBuilder().setCustomId("next_page").setLabel("➡️").setStyle(ButtonStyle.Secondary));
    }
  }
  // Botão de categorias
  botoes.push(new ButtonBuilder().setCustomId("categorias").setLabel("Categorias").setStyle(ButtonStyle.Success));
  // Botão de busca
  botoes.push(new ButtonBuilder().setCustomId("buscar").setLabel("Buscar").setStyle(ButtonStyle.Secondary));
  return botoes;
}

function criarRow(botoes) {
  // Discord permite até 5 botões por row
  const rows = [];
  for (let i = 0; i < botoes.length; i += 5) {
    rows.push(new ActionRowBuilder().addComponents(botoes.slice(i, i + 5)));
  }
  return rows;
}

export async function execute(interaction) {
  await mostrarMenu(interaction, 0, "", "");
}

async function mostrarMenu(interaction, pagina, query, categoria) {
  const lista = filtrarFuncoes(query, categoria);
  const totalPaginas = Math.ceil(lista.length / PAGE_SIZE);
  const paginaAtual = Math.max(0, Math.min(pagina, totalPaginas - 1));
  const funcoesPagina = lista.slice(paginaAtual * PAGE_SIZE, (paginaAtual + 1) * PAGE_SIZE);
  const botoes = criarBotoes(funcoesPagina, paginaAtual, totalPaginas, query, categoria);
  const rows = criarRow(botoes);
  const categorias = gerarCategorias();
  let content = `Menu de Funções\nPágina ${paginaAtual + 1} de ${totalPaginas}\nTotal: ${lista.length} funções`;
  if (categoria) content += `\nCategoria: ${categoria}`;
  if (query) content += `\nBusca: ${query}`;
  const reply = await interaction.reply({
    content,
    components: rows,
    fetchReply: true
  });
  saveMenuState({
    channelId: reply.channel.id,
    messageId: reply.id,
    pagina: paginaAtual,
    query,
    categoria
  });
}

export async function restoreMenu(client) {
  const state = loadMenuState();
  if (!state) return;
  try {
    const channel = await client.channels.fetch(state.channelId);
    if (!channel) return;
    const message = await channel.messages.fetch(state.messageId);
    if (!message) return;
    const lista = filtrarFuncoes(state.query, state.categoria);
    const totalPaginas = Math.ceil(lista.length / PAGE_SIZE);
    const paginaAtual = Math.max(0, Math.min(state.pagina || 0, totalPaginas - 1));
    const funcoesPagina = lista.slice(paginaAtual * PAGE_SIZE, (paginaAtual + 1) * PAGE_SIZE);
    const botoes = criarBotoes(funcoesPagina, paginaAtual, totalPaginas, state.query, state.categoria);
    const rows = criarRow(botoes);
    let content = `Menu de Funções\nPágina ${paginaAtual + 1} de ${totalPaginas}\nTotal: ${lista.length} funções`;
    if (state.categoria) content += `\nCategoria: ${state.categoria}`;
    if (state.query) content += `\nBusca: ${state.query}`;
    await message.edit({ content, components: rows });
  } catch (err) {
    fs.unlinkSync(MENU_STATE_FILE);
  }
}

// Funções de moderação
const funcoesModeracao = [
  {
    id: "banir",
    nome: "Banir usuário",
    categoria: "Moderação",
    acao: async (interaction) => {
      if (!interaction.member.permissions.has('BanMembers')) {
        await interaction.reply({ content: "Você não tem permissão para banir membros.", ephemeral: true });
        return;
      }
      const user = interaction.options?.getUser?.("usuario") || interaction.user;
      try {
        await interaction.guild.members.ban(user.id);
        await interaction.reply({ content: `Usuário ${user.tag} banido com sucesso!`, ephemeral: true });
      } catch (err) {
        await interaction.reply({ content: "Erro ao banir usuário.", ephemeral: true });
      }
    }
  },
  {
    id: "expulsar",
    nome: "Expulsar usuário",
    categoria: "Moderação",
    acao: async (interaction) => {
      if (!interaction.member.permissions.has('KickMembers')) {
        await interaction.reply({ content: "Você não tem permissão para expulsar membros.", ephemeral: true });
        return;
      }
      const user = interaction.options?.getUser?.("usuario") || interaction.user;
      try {
        await interaction.guild.members.kick(user.id);
        await interaction.reply({ content: `Usuário ${user.tag} expulso com sucesso!`, ephemeral: true });
      } catch (err) {
        await interaction.reply({ content: "Erro ao expulsar usuário.", ephemeral: true });
      }
    }
  },
  {
    id: "silenciar",
    nome: "Silenciar usuário",
    categoria: "Moderação",
    acao: async (interaction) => {
      if (!interaction.member.permissions.has('ModerateMembers')) {
        await interaction.reply({ content: "Você não tem permissão para silenciar membros.", ephemeral: true });
        return;
      }
      const user = interaction.options?.getUser?.("usuario") || interaction.user;
      try {
        const member = await interaction.guild.members.fetch(user.id);
        await member.timeout(10 * 60 * 1000); // 10 minutos
        await interaction.reply({ content: `Usuário ${user.tag} silenciado por 10 minutos!`, ephemeral: true });
      } catch (err) {
        await interaction.reply({ content: "Erro ao silenciar usuário.", ephemeral: true });
      }
    }
  },
  {
    id: "limpar",
    nome: "Limpar mensagens",
    categoria: "Moderação",
    acao: async (interaction) => {
      if (!interaction.member.permissions.has('ManageMessages')) {
        await interaction.reply({ content: "Você não tem permissão para limpar mensagens.", ephemeral: true });
        return;
      }
      try {
        const channel = interaction.channel;
        const messages = await channel.bulkDelete(10, true);
        await interaction.reply({ content: `Foram apagadas ${messages.size} mensagens.`, ephemeral: true });
      } catch (err) {
        await interaction.reply({ content: "Erro ao limpar mensagens.", ephemeral: true });
      }
    }
  }
];



export async function handleButton(interaction) {
  if (!interaction.isButton()) return;
  const state = loadMenuState() || { pagina: 0, query: "", categoria: "" };
  let { pagina, query, categoria } = state;
  if (interaction.customId === "next_page") {
    pagina++;
  } else if (interaction.customId === "prev_page") {
    pagina--;
  } else if (interaction.customId === "categorias") {
    const categorias = gerarCategorias();
    const botoes = categorias.map(cat => new ButtonBuilder().setCustomId(`cat_${cat}`).setLabel(cat).setStyle(ButtonStyle.Primary));
    const rows = criarRow(botoes);
    await interaction.reply({ content: "Escolha uma categoria:", components: rows, ephemeral: true });
    return;
  } else if (interaction.customId.startsWith("cat_")) {
    categoria = interaction.customId.replace("cat_", "");
    pagina = 0;
  } else if (interaction.customId === "buscar") {
    await interaction.reply({ content: "Envie sua busca no chat (exemplo: /menu buscar <termo>)", ephemeral: true });
    return;
  } else if (interaction.customId.startsWith("func_")) {
    const funcId = interaction.customId.replace("func_", "");
    const func = funcoes.find(f => f.id === `func_${funcId}`);
    if (func && func.categoria === "Moderação" && typeof func.acao === "function") {
      await func.acao(interaction);
      return;
    }
    await interaction.reply({ content: func ? `Você selecionou: ${func.nome}` : "Função não encontrada.", ephemeral: true });
    return;
  }
  await mostrarMenu(interaction, pagina, query, categoria);
}