// Sistema de tickets para suporte e atendimento
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { db } from '../../src/database/index.js';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import axios from 'axios';

// Categorias de tickets com palavras-chave para categorização automática
const CATEGORIAS = {
  'suporte': ['ajuda', 'problema', 'erro', 'bug', 'dúvida', 'como', 'funciona'],
  'sugestão': ['sugestão', 'ideia', 'melhoria', 'implementar', 'adicionar', 'novo'],
  'denúncia': ['denúncia', 'report', 'reportar', 'comportamento', 'inadequado', 'spam', 'ofensa'],
  'parceria': ['parceria', 'divulgação', 'colaboração', 'propaganda', 'anúncio', 'promover'],
  'outro': []
};

// Tempo de inatividade (em ms) para fechar automaticamente um ticket (3 dias)
const TEMPO_INATIVIDADE = 3 * 24 * 60 * 60 * 1000;
// Tempo de aviso antes do fechamento (em ms) (1 dia)
const TEMPO_AVISO = 2 * 24 * 60 * 60 * 1000;

/**
 * Cria um novo ticket
 * @param {Object} interaction - Interação do Discord
 * @param {string} assunto - Assunto do ticket
 * @param {string} mensagemInicial - Mensagem inicial do ticket
 */
async function criarTicket(interaction, assunto, mensagemInicial) {
  const { guild, user } = interaction;
  
  // Verifica se o usuário já tem um ticket aberto
  const ticketExistente = await db.tickets.findOne({
    guildId: guild.id,
    userId: user.id,
    status: 'open'
  });
  
  if (ticketExistente) {
    return interaction.reply({
      content: `Você já possui um ticket aberto em <#${ticketExistente.channelId}>`,
      ephemeral: true
    });
  }
  
  // Determina a categoria com base nas palavras-chave
  let categoria = 'outro';
  const mensagemLower = mensagemInicial.toLowerCase();
  
  for (const [cat, palavrasChave] of Object.entries(CATEGORIAS)) {
    if (palavrasChave.some(palavra => mensagemLower.includes(palavra))) {
      categoria = cat;
      break;
    }
  }
  
  try {
    // Cria o canal de ticket
    const channel = await guild.channels.create(`ticket-${user.username}`, {
      type: 'GUILD_TEXT',
      permissionOverwrites: [
        {
          id: guild.id,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: user.id,
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
        }
      ]
    });
    
    // Cria o ticket no banco de dados
    const novoTicket = await db.tickets.create({
      guildId: guild.id,
      channelId: channel.id,
      userId: user.id,
      category: categoria,
      subject: assunto,
      messages: [{
        userId: user.id,
        content: mensagemInicial,
        timestamp: new Date()
      }]
    });
    
    // Cria o embed de boas-vindas
    const embed = new MessageEmbed()
      .setTitle(`Ticket: ${assunto}`)
      .setDescription(`Ticket criado por ${user.tag}`)
      .addField('Categoria', categoria)
      .addField('Mensagem inicial', mensagemInicial)
      .setColor(categoria === 'suporte' ? 'BLUE' : 
               categoria === 'sugestão' ? 'GREEN' : 
               categoria === 'denúncia' ? 'RED' : 
               categoria === 'parceria' ? 'PURPLE' : 'GREY')
      .setTimestamp();
    
    // Cria os botões de ação
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId(`ticket_close_${novoTicket._id}`)
          .setLabel('Fechar Ticket')
          .setStyle('DANGER'),
        new MessageButton()
          .setCustomId(`ticket_transcript_${novoTicket._id}`)
          .setLabel('Gerar Transcrição')
          .setStyle('PRIMARY')
      );
    
    await channel.send({ embeds: [embed], components: [row] });
    
    // Notifica o usuário
    return interaction.reply({
      content: `Seu ticket foi criado com sucesso em ${channel}`,
      ephemeral: true
    });
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    return interaction.reply({
      content: 'Ocorreu um erro ao criar o ticket. Por favor, tente novamente mais tarde.',
      ephemeral: true
    });
  }
}

/**
 * Fecha um ticket
 * @param {Object} interaction - Interação do Discord
 * @param {string} ticketId - ID do ticket
 * @param {boolean} forceClose - Forçar fechamento mesmo com mensagens recentes
 */
async function fecharTicket(interaction, ticketId, forceClose = false) {
  try {
    const ticket = await db.tickets.findById(ticketId);
    
    if (!ticket) {
      return interaction.reply({
        content: 'Ticket não encontrado.',
        ephemeral: true
      });
    }
    
    if (ticket.status === 'closed') {
      return interaction.reply({
        content: 'Este ticket já está fechado.',
        ephemeral: true
      });
    }
    
    // Gera a transcrição antes de fechar
    const transcriptUrl = await gerarTranscricao(interaction.guild, ticket);
    
    // Atualiza o ticket no banco de dados
    await db.tickets.findByIdAndUpdate(ticketId, {
      status: 'closed',
      closedAt: new Date(),
      transcriptUrl
    });
    
    // Cria o embed de fechamento
    const embed = new MessageEmbed()
      .setTitle('Ticket Fechado')
      .setDescription(`Este ticket foi fechado por ${interaction.user.tag}`)
      .addField('Transcrição', transcriptUrl ? 'Disponível abaixo' : 'Não disponível')
      .setColor('RED')
      .setTimestamp();
    
    // Cria o botão de reabertura
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId(`ticket_reopen_${ticketId}`)
          .setLabel('Reabrir Ticket')
          .setStyle('SUCCESS'),
        new MessageButton()
          .setCustomId(`ticket_delete_${ticketId}`)
          .setLabel('Excluir Canal')
          .setStyle('DANGER')
      );
    
    await interaction.reply({ embeds: [embed], components: [row] });
    
    // Envia mensagem privada para o criador do ticket
    const user = await interaction.client.users.fetch(ticket.userId);
    if (user) {
      const dmEmbed = new MessageEmbed()
        .setTitle('Seu ticket foi fechado')
        .setDescription(`Seu ticket em ${interaction.guild.name} foi fechado.`)
        .addField('Assunto', ticket.subject)
        .addField('Transcrição', transcriptUrl || 'Não disponível')
        .setColor('BLUE')
        .setTimestamp();
      
      await user.send({ embeds: [dmEmbed] }).catch(() => {
        // Ignora erros de DM bloqueada
      });
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao fechar ticket:', error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'Ocorreu um erro ao fechar o ticket.',
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: 'Ocorreu um erro ao fechar o ticket.',
        ephemeral: true
      });
    }
    return false;
  }
}

/**
 * Reabre um ticket fechado
 * @param {Object} interaction - Interação do Discord
 * @param {string} ticketId - ID do ticket
 */
async function reabrirTicket(interaction, ticketId) {
  try {
    const ticket = await db.tickets.findById(ticketId);
    
    if (!ticket) {
      return interaction.reply({
        content: 'Ticket não encontrado.',
        ephemeral: true
      });
    }
    
    if (ticket.status === 'open') {
      return interaction.reply({
        content: 'Este ticket já está aberto.',
        ephemeral: true
      });
    }
    
    // Atualiza o ticket no banco de dados
    await db.tickets.findByIdAndUpdate(ticketId, {
      status: 'open',
      closedAt: null,
      lastActivity: new Date(),
      reopenCount: (ticket.reopenCount || 0) + 1
    });
    
    // Cria o embed de reabertura
    const embed = new MessageEmbed()
      .setTitle('Ticket Reaberto')
      .setDescription(`Este ticket foi reaberto por ${interaction.user.tag}`)
      .setColor('GREEN')
      .setTimestamp();
    
    // Cria os botões de ação
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId(`ticket_close_${ticketId}`)
          .setLabel('Fechar Ticket')
          .setStyle('DANGER'),
        new MessageButton()
          .setCustomId(`ticket_transcript_${ticketId}`)
          .setLabel('Gerar Transcrição')
          .setStyle('PRIMARY')
      );
    
    await interaction.reply({ embeds: [embed], components: [row] });
    
    // Notifica o criador do ticket
    const user = await interaction.client.users.fetch(ticket.userId);
    if (user) {
      const dmEmbed = new MessageEmbed()
        .setTitle('Seu ticket foi reaberto')
        .setDescription(`Seu ticket em ${interaction.guild.name} foi reaberto.`)
        .addField('Assunto', ticket.subject)
        .setColor('GREEN')
        .setTimestamp();
      
      await user.send({ embeds: [dmEmbed] }).catch(() => {
        // Ignora erros de DM bloqueada
      });
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao reabrir ticket:', error);
    await interaction.reply({
      content: 'Ocorreu um erro ao reabrir o ticket.',
      ephemeral: true
    });
    return false;
  }
}

/**
 * Gera uma transcrição em PDF do ticket
 * @param {Object} guild - Servidor do Discord
 * @param {Object} ticket - Objeto do ticket
 * @returns {Promise<string>} URL da transcrição
 */
async function gerarTranscricao(guild, ticket) {
  try {
    const channel = await guild.channels.fetch(ticket.channelId).catch(() => null);
    if (!channel) return null;
    
    // Cria o documento PDF
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `../../temp/transcript-${ticket._id}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    
    // Configura o documento
    doc.pipe(writeStream);
    
    // Adiciona cabeçalho
    doc.fontSize(20).text(`Transcrição de Ticket - ${ticket.subject}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Servidor: ${guild.name}`);
    doc.text(`Categoria: ${ticket.category}`);
    doc.text(`Criado em: ${new Date(ticket.createdAt).toLocaleString('pt-BR')}`);
    doc.text(`Fechado em: ${ticket.closedAt ? new Date(ticket.closedAt).toLocaleString('pt-BR') : 'N/A'}`);
    doc.text(`Criado por: ${(await guild.members.fetch(ticket.userId).catch(() => ({ user: { tag: 'Usuário não encontrado' } }))).user.tag}`);
    doc.moveDown();
    
    // Adiciona as mensagens
    doc.fontSize(16).text('Mensagens:', { underline: true });
    doc.moveDown();
    
    // Se tiver mensagens armazenadas no banco, usa elas
    if (ticket.messages && ticket.messages.length > 0) {
      for (const msg of ticket.messages) {
        const username = (await guild.members.fetch(msg.userId).catch(() => ({ user: { tag: 'Usuário não encontrado' } }))).user.tag;
        doc.fontSize(10).text(`${username} - ${new Date(msg.timestamp).toLocaleString('pt-BR')}`, { underline: true });
        doc.fontSize(12).text(msg.content);
        
        if (msg.attachments && msg.attachments.length > 0) {
          doc.text('Anexos:');
          for (const attachment of msg.attachments) {
            doc.text(`- ${attachment.name}: ${attachment.url}`);
          }
        }
        
        doc.moveDown();
      }
    } else {
      // Tenta buscar as mensagens diretamente do canal
      const messages = await channel.messages.fetch({ limit: 100 });
      const sortedMessages = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
      
      for (const msg of sortedMessages) {
        if (msg.author.bot && msg.embeds.length > 0) continue; // Pula embeds de bots
        
        doc.fontSize(10).text(`${msg.author.tag} - ${new Date(msg.createdTimestamp).toLocaleString('pt-BR')}`, { underline: true });
        doc.fontSize(12).text(msg.content || '[Sem conteúdo]');
        
        if (msg.attachments.size > 0) {
          doc.text('Anexos:');
          msg.attachments.forEach(attachment => {
            doc.text(`- ${attachment.name}: ${attachment.url}`);
          });
        }
        
        doc.moveDown();
      }
    }
    
    // Finaliza o documento
    doc.end();
    
    // Retorna uma promessa que resolve quando o arquivo for escrito
    return new Promise((resolve, reject) => {
      writeStream.on('finish', async () => {
        try {
          // Aqui você pode fazer upload do arquivo para algum serviço de hospedagem
          // e retornar a URL. Por enquanto, vamos apenas simular uma URL local
          const url = `attachment://transcript-${ticket._id}.pdf`;
          resolve(url);
        } catch (error) {
          reject(error);
        }
      });
      
      writeStream.on('error', reject);
    });
  } catch (error) {
    console.error('Erro ao gerar transcrição:', error);
    return null;
  }
}

/**
 * Verifica tickets inativos e envia avisos ou fecha automaticamente
 * @param {Object} client - Cliente do Discord
 */
async function verificarTicketsInativos(client) {
  try {
    const agora = new Date();
    
    // Busca tickets abertos
    const tickets = await db.tickets.find({ status: 'open' });
    
    for (const ticket of tickets) {
      const ultimaAtividade = new Date(ticket.lastActivity);
      const tempoInativo = agora - ultimaAtividade;
      
      // Se estiver inativo por mais tempo que o limite, fecha o ticket
      if (tempoInativo >= TEMPO_INATIVIDADE) {
        const guild = await client.guilds.fetch(ticket.guildId).catch(() => null);
        if (!guild) continue;
        
        const channel = await guild.channels.fetch(ticket.channelId).catch(() => null);
        if (!channel) continue;
        
        // Cria o embed de fechamento automático
        const embed = new MessageEmbed()
          .setTitle('Ticket Fechado Automaticamente')
          .setDescription('Este ticket foi fechado automaticamente devido à inatividade.')
          .setColor('ORANGE')
          .setTimestamp();
        
        await channel.send({ embeds: [embed] });
        
        // Gera a transcrição
        const transcriptUrl = await gerarTranscricao(guild, ticket);
        
        // Atualiza o ticket no banco de dados
        await db.tickets.findByIdAndUpdate(ticket._id, {
          status: 'closed',
          closedAt: new Date(),
          transcriptUrl
        });
        
        // Cria o botão de reabertura
        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId(`ticket_reopen_${ticket._id}`)
              .setLabel('Reabrir Ticket')
              .setStyle('SUCCESS'),
            new MessageButton()
              .setCustomId(`ticket_delete_${ticket._id}`)
              .setLabel('Excluir Canal')
              .setStyle('DANGER')
          );
        
        await channel.send({ components: [row] });
        
        // Notifica o criador do ticket
        const user = await client.users.fetch(ticket.userId).catch(() => null);
        if (user) {
          const dmEmbed = new MessageEmbed()
            .setTitle('Seu ticket foi fechado automaticamente')
            .setDescription(`Seu ticket em ${guild.name} foi fechado automaticamente devido à inatividade.`)
            .addField('Assunto', ticket.subject)
            .addField('Transcrição', transcriptUrl || 'Não disponível')
            .setColor('ORANGE')
            .setTimestamp();
          
          await user.send({ embeds: [dmEmbed] }).catch(() => {
            // Ignora erros de DM bloqueada
          });
        }
      }
      // Se estiver próximo do tempo limite, envia um aviso
      else if (tempoInativo >= TEMPO_AVISO && !ticket.autoCloseWarned) {
        const guild = await client.guilds.fetch(ticket.guildId).catch(() => null);
        if (!guild) continue;
        
        const channel = await guild.channels.fetch(ticket.channelId).catch(() => null);
        if (!channel) continue;
        
        // Cria o embed de aviso
        const embed = new MessageEmbed()
          .setTitle('Aviso de Inatividade')
          .setDescription(`Este ticket será fechado automaticamente em ${Math.ceil((TEMPO_INATIVIDADE - tempoInativo) / (24 * 60 * 60 * 1000))} dias devido à inatividade.`)
          .setColor('YELLOW')
          .setTimestamp();
        
        await channel.send({ embeds: [embed] });
        
        // Marca o ticket como avisado
        await db.tickets.findByIdAndUpdate(ticket._id, {
          autoCloseWarned: true
        });
      }
    }
  } catch (error) {
    console.error('Erro ao verificar tickets inativos:', error);
  }
}

/**
 * Cria um painel de tickets
 * @param {Object} interaction - Interação do Discord
 * @param {string} canalId - ID do canal para enviar o painel
 */
async function criarPainelTickets(interaction, canalId) {
  try {
    const canal = await interaction.guild.channels.fetch(canalId);
    
    if (!canal) {
      return interaction.reply({
        content: 'Canal não encontrado.',
        ephemeral: true
      });
    }
    
    // Cria o embed do painel
    const embed = new MessageEmbed()
      .setTitle('📝 Sistema de Tickets')
      .setDescription('Clique no botão abaixo para abrir um novo ticket de suporte.')
      .addField('Categorias Disponíveis', Object.keys(CATEGORIAS).map(cat => `• ${cat.charAt(0).toUpperCase() + cat.slice(1)}`).join('\n'))
      .setColor('BLUE')
      .setFooter({ text: 'O ticket será categorizado automaticamente com base na sua mensagem inicial.' });
    
    // Cria o botão para abrir ticket
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('ticket_create')
          .setLabel('Abrir Ticket')
          .setStyle('SUCCESS')
          .setEmoji('🎫')
      );
    
    await canal.send({ embeds: [embed], components: [row] });
    
    return interaction.reply({
      content: `Painel de tickets criado com sucesso em ${canal}.`,
      ephemeral: true
    });
  } catch (error) {
    console.error('Erro ao criar painel de tickets:', error);
    return interaction.reply({
      content: 'Ocorreu um erro ao criar o painel de tickets.',
      ephemeral: true
    });
  }
}

/**
 * Registra uma nova mensagem no ticket
 * @param {Object} message - Mensagem do Discord
 */
async function registrarMensagemTicket(message) {
  // Ignora mensagens de bots e DMs
  if (message.author.bot || !message.guild) return;
  
  // Verifica se o canal é um ticket
  const ticket = await db.tickets.findOne({
    channelId: message.channel.id,
    status: 'open'
  });
  
  if (!ticket) return;
  
  // Registra a mensagem no banco de dados
  const anexos = [];
  if (message.attachments.size > 0) {
    message.attachments.forEach(attachment => {
      anexos.push({
        url: attachment.url,
        name: attachment.name
      });
    });
  }
  
  await db.tickets.findByIdAndUpdate(ticket._id, {
    $push: {
      messages: {
        userId: message.author.id,
        content: message.content,
        timestamp: new Date(),
        attachments: anexos
      }
    },
    lastActivity: new Date(),
    autoCloseWarned: false // Reseta o aviso de fechamento automático
  });
}

/**
 * Exclui um canal de ticket
 * @param {Object} interaction - Interação do Discord
 * @param {string} ticketId - ID do ticket
 */
async function excluirCanalTicket(interaction, ticketId) {
  try {
    const ticket = await db.tickets.findById(ticketId);
    
    if (!ticket) {
      return interaction.reply({
        content: 'Ticket não encontrado.',
        ephemeral: true
      });
    }
    
    // Verifica se o ticket está fechado
    if (ticket.status !== 'closed') {
      return interaction.reply({
        content: 'O ticket precisa estar fechado para excluir o canal.',
        ephemeral: true
      });
    }
    
    // Avisa que o canal será excluído
    await interaction.reply({
      content: 'O canal será excluído em 5 segundos...',
      ephemeral: false
    });
    
    // Aguarda 5 segundos e exclui o canal
    setTimeout(async () => {
      const channel = await interaction.guild.channels.fetch(ticket.channelId).catch(() => null);
      if (channel) {
        await channel.delete().catch(console.error);
      }
    }, 5000);
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir canal de ticket:', error);
    if (!interaction.replied) {
      await interaction.reply({
        content: 'Ocorreu um erro ao excluir o canal.',
        ephemeral: true
      });
    }
    return false;
  }
}

export {
  criarTicket,
  fecharTicket,
  reabrirTicket,
  gerarTranscricao,
  verificarTicketsInativos,
  criarPainelTickets,
  registrarMensagemTicket,
  excluirCanalTicket,
  CATEGORIAS
};