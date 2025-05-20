import { CommandBuilder, CommandRunOptions } from '@constatic/core';
import { ApplicationCommandOptionType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, ButtonInteraction, TextChannel, GuildMember, ColorResolvable } from 'discord.js';
import mongoose from 'mongoose';
import { setTimeout } from 'node:timers/promises';

// Schema do MongoDB para os sorteios
const GiveawaySchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  channelId: { type: String, required: true },
  guildId: { type: String, required: true },
  hostId: { type: String, required: true },
  prize: { type: String, required: true },
  description: { type: String, default: '' },
  winners: { type: Number, default: 1 },
  endAt: { type: Date, required: true },
  participants: { type: [String], default: [] },
  ended: { type: Boolean, default: false },
});

// Model do MongoDB
const GiveawayModel = mongoose.model('Giveaway', GiveawaySchema);

// Função para formatar a duração
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([hdwm])$/);
  if (!match) return 0;

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    h: 60 * 60 * 1000, // horas
    d: 24 * 60 * 60 * 1000, // dias
    w: 7 * 24 * 60 * 60 * 1000, // semanas
    m: 30 * 24 * 60 * 60 * 1000, // meses (aproximadamente)
  };

  return value * multipliers[unit];
}

// Função para criar o embed do sorteio
function createGiveawayEmbed(
  prize: string,
  description: string,
  endAt: Date,
  hostId: string,
  winners: number,
  participants: string[]
) {
  const embed = new EmbedBuilder()
    .setTitle(`🎉 SORTEIO: ${prize}`)
    .setDescription(description || 'Sem descrição fornecida.')
    .setColor('#FF5733' as ColorResolvable)
    .addFields(
      { name: '⏰ Final', value: `<t:${Math.floor(endAt.getTime() / 1000)}:R>`, inline: true },
      { name: '👑 Organizador', value: `<@${hostId}>`, inline: true },
      { name: '🏆 Vencedores', value: winners.toString(), inline: true },
      { name: '👥 Participantes', value: participants.length.toString(), inline: true }
    )
    .setFooter({ text: 'Clique no botão abaixo para participar!' })
    .setTimestamp();

  return embed;
}

// Função para criar o embed de vitória
function createWinnerEmbed(prize: string, hostId: string, winners: string[]) {
  const embed = new EmbedBuilder()
    .setTitle(`🎊 SORTEIO FINALIZADO: ${prize}`)
    .setDescription(`Parabéns aos vencedores!`)
    .setColor('#33FF57' as ColorResolvable)
    .addFields(
      { name: '🏆 Vencedores', value: winners.length > 0 ? winners.map(id => `<@${id}>`).join('\n') : 'Nenhum participante válido.', inline: false },
      { name: '👑 Organizador', value: `<@${hostId}>`, inline: true },
    )
    .setFooter({ text: 'Obrigado a todos que participaram!' })
    .setTimestamp();

  return embed;
}

// Função para finalizar o sorteio
async function endGiveaway(messageId: string, channelId: string, guildId: string) {
  const giveaway = await GiveawayModel.findOne({
    messageId,
    channelId,
    guildId,
    ended: false,
  });

  if (!giveaway) return;

  const channel = global.client.channels.cache.get(channelId) as TextChannel;
  if (!channel) return;

  try {
    const message = await channel.messages.fetch(messageId);
    if (!message) return;

    // Atualizar o status do sorteio
    giveaway.ended = true;

    // Selecionar os vencedores
    const participants = giveaway.participants;
    const winnerCount = Math.min(giveaway.winners, participants.length);
    const winners: string[] = [];

    // Algoritmo para selecionar vencedores aleatórios sem repetição
    if (participants.length > 0) {
      const shuffled = [...participants].sort(() => 0.5 - Math.random());
      winners.push(...shuffled.slice(0, winnerCount));
    }

    // Enviar embed com os vencedores
    const winnerEmbed = createWinnerEmbed(giveaway.prize, giveaway.hostId, winners);
    await message.reply({ embeds: [winnerEmbed] });

    // Desativar botão do sorteio
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`giveaway-join-${messageId}`)
          .setLabel(`Participar (${participants.length})`)
          .setEmoji('🎉')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

    // Atualizar a mensagem original
    await message.edit({
      embeds: [
        EmbedBuilder.from(message.embeds[0])
          .setTitle(`🎉 SORTEIO FINALIZADO: ${giveaway.prize}`)
          .setColor('#808080' as ColorResolvable)
      ],
      components: [row]
    });

    // Salvar os vencedores no banco de dados
    await giveaway.save();

    // Avisar os vencedores
    if (winners.length > 0) {
      const winnerMention = winners.map(id => `<@${id}>`).join(' ');
      await channel.send({
        content: `Parabéns ${winnerMention}! Vocês ganharam: **${giveaway.prize}**!`,
        allowedMentions: { users: winners }
      });
    }
  } catch (error) {
    console.error('Erro ao finalizar sorteio:', error);
  }
}

// Construção do comando
export default new CommandBuilder()
  .setName('sorteio')
  .setDescription('Gerencia sorteios no servidor')
  .addSubcommand(subcommand =>
    subcommand
      .setName('criar')
      .setDescription('Cria um novo sorteio')
      .addStringOption(option =>
        option.setName('premio')
          .setDescription('O prêmio do sorteio')
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('duracao')
          .setDescription('Duração do sorteio (1h, 1d, 1w, 1m)')
          .setRequired(true)
      )
      .addIntegerOption(option =>
        option.setName('vencedores')
          .setDescription('Quantidade de vencedores')
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(10)
      )
      .addStringOption(option =>
        option.setName('descricao')
          .setDescription('Descrição do sorteio')
          .setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('reroll')
      .setDescription('Sorteia novos vencedores para um sorteio')
      .addStringOption(option =>
        option.setName('mensagem_id')
          .setDescription('ID da mensagem do sorteio')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('finalizar')
      .setDescription('Finaliza um sorteio manualmente')
      .addStringOption(option =>
        option.setName('mensagem_id')
          .setDescription('ID da mensagem do sorteio')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('listar')
      .setDescription('Lista todos os sorteios ativos no servidor')
  )
  .setDMPermission(false)
  .setDefaultMemberPermissions(0)
  .run(async ({ interaction, client }: CommandRunOptions) => {
    if (!interaction.inCachedGuild()) return;

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'criar') {
      const prize = interaction.options.getString('premio', true);
      const durationStr = interaction.options.getString('duracao', true);
      const winnerCount = interaction.options.getInteger('vencedores') || 1;
      const description = interaction.options.getString('descricao') || '';

      // Validar a duração
      const duration = parseDuration(durationStr);
      if (duration <= 0) {
        return interaction.reply({
          content: 'Formato de duração inválido. Use, por exemplo: 1h, 6h, 1d, 3d, 1w, 1m',
          ephemeral: true
        });
      }

      // Calcular a data de fim
      const endAt = new Date(Date.now() + duration);

      // Responder ao usuário que o sorteio está sendo criado
      await interaction.deferReply();

      try {
        // Criar o embed do sorteio
        const embed = createGiveawayEmbed(
          prize,
          description,
          endAt,
          interaction.user.id,
          winnerCount,
          []
        );

        // Criar o botão de participação
        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`giveaway-join-placeholder`)
              .setLabel('Participar (0)')
              .setEmoji('🎉')
              .setStyle(ButtonStyle.Primary)
          );

        // Enviar a mensagem do sorteio
        const reply = await interaction.followUp({
          embeds: [embed],
          components: [row],
          fetchReply: true
        });

        // Atualizar o ID do botão com o ID da mensagem
        const updatedRow = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`giveaway-join-${reply.id}`)
              .setLabel('Participar (0)')
              .setEmoji('🎉')
              .setStyle(ButtonStyle.Primary)
          );

        await reply.edit({ components: [updatedRow] });

        // Salvar o sorteio no banco de dados
        const giveaway = new GiveawayModel({
          messageId: reply.id,
          channelId: interaction.channelId,
          guildId: interaction.guildId,
          hostId: interaction.user.id,
          prize,
          description,
          winners: winnerCount,
          endAt,
          participants: [],
        });

        await giveaway.save();

        // Agendar o fim do sorteio
        setTimeout(async () => {
          await endGiveaway(reply.id, interaction.channelId, interaction.guildId);
        }, duration);

      } catch (error) {
        console.error('Erro ao criar sorteio:', error);
        await interaction.followUp({
          content: 'Ocorreu um erro ao criar o sorteio.',
          ephemeral: true
        });
      }
    } else if (subcommand === 'reroll') {
      const messageId = interaction.options.getString('mensagem_id', true);
      
      await interaction.deferReply();

      // Buscar o sorteio no banco de dados
      const giveaway = await GiveawayModel.findOne({
        messageId,
        guildId: interaction.guildId,
        ended: true,
      });

      if (!giveaway) {
        return interaction.followUp({
          content: 'Sorteio não encontrado ou ainda não finalizado.',
          ephemeral: true
        });
      }

      // Verificar se há participantes
      if (giveaway.participants.length === 0) {
        return interaction.followUp({
          content: 'Não é possível refazer o sorteio pois não há participantes.',
          ephemeral: true
        });
      }

      try {
        // Selecionar novos vencedores
        const participants = giveaway.participants;
        const winnerCount = Math.min(giveaway.winners, participants.length);
        const winners: string[] = [];

        // Algoritmo para selecionar vencedores aleatórios
        const shuffled = [...participants].sort(() => 0.5 - Math.random());
        winners.push(...shuffled.slice(0, winnerCount));

        // Criar embed de novos vencedores
        const winnerEmbed = createWinnerEmbed(giveaway.prize, giveaway.hostId, winners);
        winnerEmbed.setTitle(`🎊 SORTEIO REFEITO: ${giveaway.prize}`);

        await interaction.followUp({ embeds: [winnerEmbed] });

        // Avisar os novos vencedores
        const channel = interaction.channel as TextChannel;
        if (winners.length > 0) {
          const winnerMention = winners.map(id => `<@${id}>`).join(' ');
          await channel.send({
            content: `Novo sorteio realizado! Parabéns ${winnerMention}! Vocês ganharam: **${giveaway.prize}**!`,
            allowedMentions: { users: winners }
          });
        }

      } catch (error) {
        console.error('Erro ao refazer sorteio:', error);
        await interaction.followUp({
          content: 'Ocorreu um erro ao refazer o sorteio.',
          ephemeral: true
        });
      }
    } else if (subcommand === 'finalizar') {
      const messageId = interaction.options.getString('mensagem_id', true);
      
      await interaction.deferReply({ ephemeral: true });

      // Verificar se o sorteio existe e ainda não terminou
      const giveaway = await GiveawayModel.findOne({
        messageId,
        guildId: interaction.guildId,
        ended: false,
      });

      if (!giveaway) {
        return interaction.followUp({
          content: 'Sorteio não encontrado ou já finalizado.',
          ephemeral: true
        });
      }

      // Verificar permissões (apenas o criador ou administradores podem finalizar)
      if (giveaway.hostId !== interaction.user.id && !interaction.memberPermissions.has('Administrator')) {
        return interaction.followUp({
          content: 'Você não tem permissão para finalizar este sorteio.',
          ephemeral: true
        });
      }

      try {
        // Finalizar o sorteio
        await endGiveaway(messageId, interaction.channelId, interaction.guildId);
        await interaction.followUp({
          content: 'Sorteio finalizado com sucesso!',
          ephemeral: true
        });
      } catch (error) {
        console.error('Erro ao finalizar sorteio:', error);
        await interaction.followUp({
          content: 'Ocorreu um erro ao finalizar o sorteio.',
          ephemeral: true
        });
      }
    } else if (subcommand === 'listar') {
      await interaction.deferReply();

      // Buscar todos os sorteios ativos do servidor
      const giveaways = await GiveawayModel.find({
        guildId: interaction.guildId,
        ended: false,
      }).sort({ endAt: 1 });

      if (giveaways.length === 0) {
        return interaction.followUp({
          content: 'Não há sorteios ativos neste servidor.',
          ephemeral: true
        });
      }

      // Criar embed com a lista
      const embed = new EmbedBuilder()
        .setTitle('🎉 Sorteios Ativos')
        .setColor('#FF5733' as ColorResolvable)
        .setDescription('Lista de todos os sorteios ativos neste servidor:')
        .setTimestamp();

      giveaways.forEach((giveaway, index) => {
        embed.addFields({
          name: `${index + 1}. ${giveaway.prize}`,
          value: `🏆 **Vencedores:** ${giveaway.winners}\n⏰ **Término:** <t:${Math.floor(giveaway.endAt.getTime() / 1000)}:R>\n👥 **Participantes:** ${giveaway.participants.length}\n📝 **ID:** \`${giveaway.messageId}\``,
          inline: false
        });
      });

      await interaction.followUp({ embeds: [embed] });
    }
  })
  .setExecuteButtonPress(async ({ interaction, client }) => {
    if (!interaction.isButton() || !interaction.inCachedGuild()) return;
    
    const customId = interaction.customId;
    
    // Verificar se é um botão de participação de sorteio
    if (!customId.startsWith('giveaway-join-')) return;
    
    // Extrair o ID da mensagem do sorteio
    const messageId = customId.replace('giveaway-join-', '');
    
    // Buscar o sorteio no banco de dados
    const giveaway = await GiveawayModel.findOne({
      messageId,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      ended: false,
    });
    
    if (!giveaway) {
      return interaction.reply({
        content: 'Este sorteio não existe ou já foi finalizado.',
        ephemeral: true
      });
    }
    
    const userId = interaction.user.id;
    const isParticipating = giveaway.participants.includes(userId);
    
    // Atualizar participação
    if (isParticipating) {
      // Remover participação
      giveaway.participants = giveaway.participants.filter(id => id !== userId);
      await interaction.reply({
        content: `Você desistiu de participar do sorteio **${giveaway.prize}**.`,
        ephemeral: true
      });
    } else {
      // Adicionar participação
      giveaway.participants.push(userId);
      await interaction.reply({
        content: `Você está participando do sorteio **${giveaway.prize}**. Boa sorte!`,
        ephemeral: true
      });
    }
    
    // Salvar alterações
    await giveaway.save();
    
    // Atualizar o botão com o novo contador
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`giveaway-join-${messageId}`)
          .setLabel(`Participar (${giveaway.participants.length})`)
          .setEmoji('🎉')
          .setStyle(ButtonStyle.Primary)
      );
    
    // Atualizar o embed
    const message = await interaction.message.fetch();
    const updatedEmbed = EmbedBuilder.from(message.embeds[0])
      .spliceFields(3, 1, { name: '👥 Participantes', value: giveaway.participants.length.toString(), inline: true });
    
    await message.edit({
      embeds: [updatedEmbed],
      components: [row]
    });
  });