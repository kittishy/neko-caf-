// Comando de interação para o sistema de tickets
import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton, MessageEmbed, Modal, TextInputComponent } from 'discord.js';
import { 
  criarTicket, 
  fecharTicket, 
  reabrirTicket, 
  gerarTranscricao, 
  criarPainelTickets, 
  excluirCanalTicket,
  verificarTicketsInativos
} from './tickets.js';

// Configuração do comando slash
const ticketCommand = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Gerencia o sistema de tickets')
    .addSubcommand(subcommand =>
      subcommand
        .setName('painel')
        .setDescription('Cria um painel de tickets em um canal')
        .addChannelOption(option =>
          option.setName('canal')
            .setDescription('Canal onde o painel será criado')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('fechar')
        .setDescription('Fecha o ticket atual'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('transcrição')
        .setDescription('Gera uma transcrição do ticket atual'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('verificar')
        .setDescription('Verifica tickets inativos (apenas para administradores)')),
  
  // Execução do comando
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'painel':
        // Verifica permissões
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
          return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true
          });
        }
        
        const canal = interaction.options.getChannel('canal');
        await criarPainelTickets(interaction, canal.id);
        break;
        
      case 'fechar':
        // Busca o ticket pelo canal atual
        const ticketFechar = await interaction.client.db.tickets.findOne({
          channelId: interaction.channel.id,
          status: 'open'
        });
        
        if (!ticketFechar) {
          return interaction.reply({
            content: 'Este canal não é um ticket aberto.',
            ephemeral: true
          });
        }
        
        await fecharTicket(interaction, ticketFechar._id);
        break;
        
      case 'transcrição':
        // Busca o ticket pelo canal atual
        const ticketTranscricao = await interaction.client.db.tickets.findOne({
          channelId: interaction.channel.id
        });
        
        if (!ticketTranscricao) {
          return interaction.reply({
            content: 'Este canal não é um ticket.',
            ephemeral: true
          });
        }
        
        await interaction.deferReply();
        const transcriptUrl = await gerarTranscricao(interaction.guild, ticketTranscricao);
        
        if (!transcriptUrl) {
          return interaction.editReply('Não foi possível gerar a transcrição.');
        }
        
        // Atualiza o ticket com a URL da transcrição
        await interaction.client.db.tickets.findByIdAndUpdate(ticketTranscricao._id, {
          transcriptUrl
        });
        
        const embed = new MessageEmbed()
          .setTitle('Transcrição do Ticket')
          .setDescription(`A transcrição deste ticket foi gerada.`)
          .setColor('BLUE')
          .setTimestamp();
        
        await interaction.editReply({
          embeds: [embed],
          files: [{
            attachment: transcriptUrl.replace('attachment://', `${__dirname}/../../temp/`),
            name: `transcript-${ticketTranscricao._id}.pdf`
          }]
        });
        break;
        
      case 'verificar':
        // Verifica permissões
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
          return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true
          });
        }
        
        await interaction.deferReply({ ephemeral: true });
        await verificarTicketsInativos(interaction.client);
        await interaction.editReply('Verificação de tickets inativos concluída.');
        break;
    }
  },
  
  // Manipulador de interações com botões
  async handleButton(interaction) {
    const customId = interaction.customId;
    
    // Botão para criar ticket
    if (customId === 'ticket_create') {
      // Cria um modal para o usuário inserir o assunto e a mensagem inicial
      const modal = new Modal()
        .setCustomId('ticket_create_modal')
        .setTitle('Criar um novo ticket');
      
      const assuntoInput = new TextInputComponent()
        .setCustomId('ticket_subject')
        .setLabel('Assunto do ticket')
        .setStyle('SHORT')
        .setPlaceholder('Ex: Problema com comandos')
        .setRequired(true);
      
      const mensagemInput = new TextInputComponent()
        .setCustomId('ticket_message')
        .setLabel('Descreva seu problema ou solicitação')
        .setStyle('PARAGRAPH')
        .setPlaceholder('Descreva detalhadamente o que você precisa...')
        .setRequired(true);
      
      const assuntoRow = new MessageActionRow().addComponents(assuntoInput);
      const mensagemRow = new MessageActionRow().addComponents(mensagemInput);
      
      modal.addComponents(assuntoRow, mensagemRow);
      
      await interaction.showModal(modal);
      return;
    }
    
    // Botões de ação em tickets existentes
    if (customId.startsWith('ticket_')) {
      const [action, ticketId] = customId.split('_').slice(1);
      
      switch (action) {
        case 'close':
          await fecharTicket(interaction, ticketId);
          break;
          
        case 'reopen':
          await reabrirTicket(interaction, ticketId);
          break;
          
        case 'transcript':
          // Busca o ticket
          const ticket = await interaction.client.db.tickets.findById(ticketId);
          
          if (!ticket) {
            return interaction.reply({
              content: 'Ticket não encontrado.',
              ephemeral: true
            });
          }
          
          await interaction.deferReply();
          const transcriptUrl = await gerarTranscricao(interaction.guild, ticket);
          
          if (!transcriptUrl) {
            return interaction.editReply('Não foi possível gerar a transcrição.');
          }
          
          // Atualiza o ticket com a URL da transcrição
          await interaction.client.db.tickets.findByIdAndUpdate(ticketId, {
            transcriptUrl
          });
          
          const embed = new MessageEmbed()
            .setTitle('Transcrição do Ticket')
            .setDescription(`A transcrição deste ticket foi gerada.`)
            .setColor('BLUE')
            .setTimestamp();
          
          await interaction.editReply({
            embeds: [embed],
            files: [{
              attachment: transcriptUrl.replace('attachment://', `${__dirname}/../../temp/`),
              name: `transcript-${ticketId}.pdf`
            }]
          });
          break;
          
        case 'delete':
          await excluirCanalTicket(interaction, ticketId);
          break;
      }
    }
  },
  
  // Manipulador de interações com modais
  async handleModal(interaction) {
    if (interaction.customId === 'ticket_create_modal') {
      const assunto = interaction.fields.getTextInputValue('ticket_subject');
      const mensagem = interaction.fields.getTextInputValue('ticket_message');
      
      await criarTicket(interaction, assunto, mensagem);
    }
  },
  
  // Manipulador de mensagens em canais de ticket
  async handleMessage(message) {
    // Verifica se a mensagem é de um canal de ticket
    const ticket = await message.client.db.tickets.findOne({
      channelId: message.channel.id,
      status: 'open'
    });
    
    if (ticket) {
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
      
      await message.client.db.tickets.findByIdAndUpdate(ticket._id, {
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
  }
};

export { ticketCommand };