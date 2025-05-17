import { createCommand, createResponder } from "#base";
import { settings } from "#settings";
import { ActionRowBuilder, ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildTextBasedChannel, User } from "discord.js";
import ms from "ms"; // Para parsear a duração

// Estrutura para armazenar os dados de um sorteio ativo
interface GiveawayData {
    messageId: string;
    channelId: string;
    guildId: string;
    prize: string;
    winnersCount: number;
    endTime: number;
    hostId: string;
    participants: Set<string>; // Set de IDs de usuários
    ended: boolean;
    winnerIds?: string[]; // Armazena os IDs dos vencedores
    timeoutId?: NodeJS.Timeout; // Para poder cancelar o timeout
}

// Simples armazenamento em memória para os sorteios ativos
// Em um bot maior, isso seria substituído por um banco de dados
const activeGiveaways = new Map<string, GiveawayData>();

/**
 * Converte uma string de duração (ex: "10m", "1h", "2d") em milissegundos.
 * Retorna null se a string for inválida.
 */
function parseDuration(durationStr: string): number | null {
    const milliseconds = ms(durationStr);
    if (isNaN(milliseconds) || milliseconds <= 0) {
        return null;
    }
    return milliseconds;
}

function createGiveawayEmbed(data: GiveawayData, endedMessage?: string) {
    const embed = new EmbedBuilder()
        .setTitle(`🎉 Sorteio: ${data.prize} 🎉`)
        .setColor(settings.colors.primary)
        .setDescription(
            `Reaja com 🎉 para participar!
` +
            `**Prêmio:** ${data.prize}
` +
            `**Vencedores:** ${data.winnersCount}
` +
            `**Organizado por:** <@${data.hostId}>
` +
            `**Termina em:** <t:${Math.floor(data.endTime / 1000)}:R> (<t:${Math.floor(data.endTime / 1000)}:f>)`
        )
        .setFooter({ text: `Participantes: ${data.participants.size}` })
        .setTimestamp(data.endTime);

    if (endedMessage) {
        embed.setDescription(endedMessage);
        embed.setColor(settings.colors.success);
    }

    return embed;
}

function createGiveawayComponents(giveawayId: string, ended = false) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const participateButton = new ButtonBuilder()
        .setCustomId(`giveaway-participate-${giveawayId}`)
        .setLabel("Participar")
        .setStyle(ButtonStyle.Success)
        .setEmoji("🎉")
        .setDisabled(ended);

    row.addComponents(participateButton);
    return row;
}

// Função para finalizar o sorteio
async function finishGiveaway(giveawayId: string, client: any, interactionGuildId?: string) {
    const giveaway = activeGiveaways.get(giveawayId);
    if (!giveaway || giveaway.ended) return;

    giveaway.ended = true;
    if (giveaway.timeoutId) {
        clearTimeout(giveaway.timeoutId);
        giveaway.timeoutId = undefined;
    }

    const participantsArray = Array.from(giveaway.participants);
    const winners: User[] = [];
    giveaway.winnerIds = []; // Limpa vencedores anteriores ou inicializa

    const guild = client.guilds.cache.get(giveaway.guildId ?? interactionGuildId);
    if (!guild) {
        console.error(`[Sorteio] Guilda ${giveaway.guildId} não encontrada para finalizar o sorteio ${giveawayId}`);
        // Não deletar o sorteio aqui, pois pode ser listado como "com erro"
        return;
    }

    const channel = guild.channels.cache.get(giveaway.channelId) as any;
    if (!channel || channel.type !== 0 && channel.type !== 5 && channel.type !== 15) {
        console.error(`[Sorteio] Canal ${giveaway.channelId} não encontrado ou não é de texto para o sorteio ${giveawayId}`);
        return;
    }

    let giveawayMessage;
    try {
        giveawayMessage = await channel.messages.fetch(giveaway.messageId);
    } catch (error) {
        console.error(`[Sorteio] Erro ao buscar mensagem ${giveaway.messageId} no canal ${giveaway.channelId}:`, error);
        // Se a mensagem não existe mais, não há muito o que fazer além de marcar como finalizado
        // activeGiveaways.delete(giveawayId); // Não remover para permitir `delete` explícito
        return;
    }

    if (participantsArray.length === 0) {
        const endedEmbed = createGiveawayEmbed(giveaway, `Sorteio encerrado! Ninguém participou. 😢`);
        await giveawayMessage.edit({ embeds: [endedEmbed], components: [createGiveawayComponents(giveawayId, true)] }).catch(console.error);
        return;
    }

    for (let i = 0; i < giveaway.winnersCount; i++) {
        if (participantsArray.length === 0) break;
        const randomIndex = Math.floor(Math.random() * participantsArray.length);
        const winnerId = participantsArray.splice(randomIndex, 1)[0];
        try {
            const winnerUser = await client.users.fetch(winnerId);
            winners.push(winnerUser);
            giveaway.winnerIds.push(winnerId);
        } catch (error) {
            console.error(`[Sorteio] Erro ao buscar usuário ${winnerId}:`, error);
            if (participantsArray.length > 0 && winners.length < giveaway.winnersCount) i--;
        }
    }

    let resultMessage = `🎉 **Sorteio encerrado!** 🎉\n**Prêmio:** ${giveaway.prize}\n`;
    if (winners.length > 0) {
        resultMessage += `Parabéns ${winners.map(w => w.toString()).join(', ')}! Vocês ganharam **${giveaway.prize}**!`;
    } else if (giveaway.participants.size > 0) {
        resultMessage += `Não foi possível determinar vencedores suficientes dentre os participantes.`;
    } else {
        resultMessage += `Não houve participantes.`;
    }

    const endedEmbed = createGiveawayEmbed(giveaway, resultMessage);
    await giveawayMessage.edit({ embeds: [endedEmbed], components: [createGiveawayComponents(giveawayId, true)] }).catch(console.error);

    if (winners.length > 0) {
        await channel.send(`Parabéns ${winners.map(w => w.toString()).join(', ')}! Vocês ganharam **${giveaway.prize}** no sorteio organizado por <@${giveaway.hostId}>.`).catch(console.error);
    }
    // Não deletar o sorteio de activeGiveaways aqui, para permitir reroll, list, delete
}

// TODO: Adicionar subcomandos para reroll, end, list, delete

export default createCommand({
    name: "sorteio",
    description: "🎉 Crie e gerencie sorteios no servidor.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "criar",
            description: "🎁 Cria um novo sorteio.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "duracao",
                    description: "Duração do sorteio (ex: 10m, 1h, 2d).",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "vencedores",
                    description: "Número de vencedores.",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    minValue: 1,
                },
                {
                    name: "premio",
                    description: "O que será sorteado?",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "canal",
                    description: "Canal onde a mensagem do sorteio será enviada (padrão: canal atual).",
                    type: ApplicationCommandOptionType.Channel,
                    required: false,
                },
            ],
        },
        {
            name: "reroll",
            description: "🔄 Refaz o sorteio de um giveaway finalizado.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id_mensagem",
                    description: "ID da mensagem do sorteio a ser re-sorteado.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "numero_vencedores",
                    description: "Número de novos vencedores a sortear (padrão: original).",
                    type: ApplicationCommandOptionType.Integer,
                    required: false,
                    minValue: 1,
                }
            ],
        },
        {
            name: "end",
            description: "🏁 Finaliza um sorteio ativo imediatamente.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id_mensagem",
                    description: "ID da mensagem do sorteio a ser finalizado.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: "list",
            description: "📜 Lista todos os sorteios ativos e recentes.",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "delete",
            description: "🗑️ Deleta um sorteio (ativo ou finalizado).",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id_mensagem",
                    description: "ID da mensagem do sorteio a ser deletado.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
    ],
    async run(interaction) {
        if (!interaction.isChatInputCommand() || !interaction.inGuild()) {
            await interaction.reply({ content: "Este comando só pode ser usado em servidores.", ephemeral: true });
            return;
        }

        const subcommand = interaction.options.getSubcommand(true);

        if (subcommand === "criar") {
            const duracaoStr = interaction.options.getString("duracao", true);
            const vencedores = interaction.options.getInteger("vencedores", true);
            const premio = interaction.options.getString("premio", true);
            const targetChannel = (interaction.options.getChannel("canal") ?? interaction.channel) as any;

            if (!targetChannel || targetChannel.type !== 0 && targetChannel.type !== 5 && targetChannel.type !== 15){
                await interaction.reply({ 
                    content: "O canal selecionado não é um canal de texto válido ou não foi encontrado.", 
                    ephemeral: true 
                });
                return;
            }

            const durationMs = parseDuration(duracaoStr);
            if (!durationMs) {
                await interaction.reply({ content: "Formato de duração inválido. Use, por exemplo: 10s, 5m, 2h, 1d.", ephemeral: true });
                return;
            }

            const endTime = Date.now() + durationMs;

            // Enviar uma mensagem de placeholder para obter o ID
            const placeholderReply = await interaction.deferReply({ ephemeral: true, fetchReply: true });
            
            const giveawayMessage = await targetChannel.send({ content: "Preparando sorteio..." });

            const giveawayData: GiveawayData = {
                messageId: giveawayMessage.id,
                channelId: targetChannel.id,
                guildId: interaction.guildId,
                prize: premio,
                winnersCount: vencedores,
                endTime: endTime,
                hostId: interaction.user.id,
                participants: new Set<string>(),
                ended: false,
                // timeoutId será definido abaixo
            };

            // activeGiveaways.set(giveawayMessage.id, giveawayData); // Movido para depois de definir timeoutId

            const embed = createGiveawayEmbed(giveawayData);
            const components = createGiveawayComponents(giveawayMessage.id);

            await giveawayMessage.edit({ content: "", embeds: [embed], components: [components] });

            await interaction.editReply({
                content: `🎉 Sorteio para **${premio}** criado com sucesso no canal ${targetChannel.toString()}!`,
            });

            // Agendar o término do sorteio
            const timeoutId = setTimeout(async () => {
                await finishGiveaway(giveawayMessage.id, interaction.client, interaction.guildId);
            }, durationMs);
            giveawayData.timeoutId = timeoutId; // Armazenar o ID do timeout para cancelamento futuro
            activeGiveaways.set(giveawayMessage.id, giveawayData); // Salvar/Atualizar o sorteio com o timeoutId

        } else if (subcommand === "end") {
            const messageId = interaction.options.getString("id_mensagem", true);
            const giveaway = activeGiveaways.get(messageId);

            if (!giveaway) {
                await interaction.reply({ content: "Sorteio não encontrado com este ID de mensagem.", ephemeral: true });
                return;
            }
            if (giveaway.ended) {
                await interaction.reply({ content: "Este sorteio já foi finalizado.", ephemeral: true });
                return;
            }
            // Verificar permissão: host do sorteio ou alguém com ManageGuild
            if (giveaway.hostId !== interaction.user.id && !interaction.memberPermissions?.has("ManageGuild")){
                 await interaction.reply({ content: "Você não tem permissão para finalizar este sorteio.", ephemeral: true });
                return;
            }

            await interaction.deferReply({ ephemeral: true });
            await finishGiveaway(messageId, interaction.client, interaction.guildId);
            await interaction.editReply({ content: `Sorteio para **${giveaway.prize}** (ID: ${messageId}) finalizado manualmente.` });

        } else if (subcommand === "reroll") {
            const messageId = interaction.options.getString("id_mensagem", true);
            const newWinnersCountInput = interaction.options.getInteger("numero_vencedores");
            const giveaway = activeGiveaways.get(messageId);

            if (!giveaway) {
                await interaction.reply({ content: "Sorteio não encontrado com este ID de mensagem.", ephemeral: true });
                return;
            }
            if (!giveaway.ended) {
                await interaction.reply({ content: "Este sorteio ainda não terminou. Finalize-o primeiro.", ephemeral: true });
                return;
            }
            if (giveaway.hostId !== interaction.user.id && !interaction.memberPermissions?.has("ManageGuild")){
                 await interaction.reply({ content: "Você não tem permissão para re-sortear este giveaway.", ephemeral: true });
                return;
            }
            if (giveaway.participants.size === 0) {
                await interaction.reply({ content: "Não há participantes neste sorteio para re-sortear.", ephemeral: true });
                return;
            }

            await interaction.deferReply();

            const numToReroll = newWinnersCountInput ?? giveaway.winnersCount;
            const newWinners: User[] = [];
            const newWinnerIds: string[] = [];

            const potentialParticipants = Array.from(giveaway.participants);
            if (potentialParticipants.length === 0) {
                 await interaction.editReply({ content: "Não há participantes elegíveis para um novo sorteio." });
                return;
            }

            for (let i = 0; i < numToReroll; i++) {
                if (potentialParticipants.length === 0) break;
                const randomIndex = Math.floor(Math.random() * potentialParticipants.length);
                const winnerId = potentialParticipants.splice(randomIndex, 1)[0]; 
                try {
                    const winnerUser = await interaction.client.users.fetch(winnerId);
                    newWinners.push(winnerUser);
                    newWinnerIds.push(winnerId);
                } catch (error) {
                    console.error(`[Sorteio Reroll] Erro ao buscar usuário ${winnerId}:`, error);
                    if (potentialParticipants.length > 0 && newWinners.length < numToReroll) i--; 
                }
            }

            if (newWinners.length === 0) {
                await interaction.editReply({ content: "Não foi possível sortear novos vencedores (talvez não haja participantes suficientes)." });
                return;
            }

            giveaway.winnerIds = newWinnerIds; 
            activeGiveaways.set(messageId, giveaway); 

            const channel = await interaction.guild?.channels.fetch(giveaway.channelId) as any;
            if (!channel || channel.type !== 0 && channel.type !== 5 && channel.type !== 15){
                await interaction.editReply({ content: "Não foi possível encontrar o canal do sorteio original para anunciar os novos vencedores." });
                return;
            }

            await channel.send(`🎉 **Novo Sorteio Realizado (Reroll)!** 🎉\n**Prêmio:** ${giveaway.prize}\nParabéns aos novos vencedores: ${newWinners.map(w => w.toString()).join(', ')}!`).catch(console.error);
            await interaction.editReply({ content: `Novos vencedores sorteados para **${giveaway.prize}** (ID: ${messageId})!` });

        } else if (subcommand === "list") {
            await interaction.deferReply({ ephemeral: true });
            
            const allGiveawaysInGuild = Array.from(activeGiveaways.values()).filter(g => g.guildId === interaction.guildId);
            const active = allGiveawaysInGuild.filter(g => !g.ended);
            const ended = allGiveawaysInGuild.filter(g => g.ended).sort((a, b) => b.endTime - a.endTime);

            if (active.length === 0 && ended.length === 0) {
                await interaction.editReply("Não há sorteios ativos ou finalizados neste servidor.");
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("📜 Lista de Sorteios no Servidor")
                .setColor(settings.colors.primary)
                .setTimestamp();

            if (active.length > 0) {
                embed.addFields({ 
                    name: `Ativos (${active.length})`, 
                    value: active.map(g => `🎁 **${g.prize}** (ID: \`${g.messageId}\`)\nTermina <t:${Math.floor(g.endTime / 1000)}:R> - ${g.participants.size} participantes`).join("\n\n") || "Nenhum"
                });
            }
            if (ended.length > 0) {
                embed.addFields({ 
                    name: `Finalizados Recentemente (${ended.slice(0,5).length} de ${ended.length})`, 
                    value: ended.slice(0, 5).map(g => `🏁 **${g.prize}** (ID: \`${g.messageId}\`)\nTerminou <t:${Math.floor(g.endTime / 1000)}:R>\nVencedores: ${g.winnerIds && g.winnerIds.length > 0 ? g.winnerIds.map(id => `<@${id}>`).join(', ') : 'N/A ou não sorteado'}`).join("\n\n") || "Nenhum"
                });
            }

            await interaction.editReply({ embeds: [embed] });

        } else if (subcommand === "delete") {
            const messageId = interaction.options.getString("id_mensagem", true);
            const giveaway = activeGiveaways.get(messageId);

            if (!giveaway) {
                await interaction.reply({ content: "Sorteio não encontrado com este ID de mensagem.", ephemeral: true });
                return;
            }
            if (giveaway.hostId !== interaction.user.id && !interaction.memberPermissions?.has("ManageGuild")){
                 await interaction.reply({ content: "Você não tem permissão para deletar este sorteio.", ephemeral: true });
                return;
            }

            await interaction.deferReply({ ephemeral: true });

            if (giveaway.timeoutId) {
                clearTimeout(giveaway.timeoutId);
            }
            activeGiveaways.delete(messageId);

            try {
                const guild = interaction.client.guilds.cache.get(giveaway.guildId);
                if (guild) {
                    const channel = guild.channels.cache.get(giveaway.channelId) as GuildTextBasedChannel | undefined;
                    if (channel && channel.isTextBased()) {
                        const msg = await channel.messages.fetch(messageId).catch(() => null);
                        if (msg) {
                            const embed = new EmbedBuilder()
                                .setTitle(`🚫 Sorteio Cancelado: ${giveaway.prize} 🚫`)
                                .setDescription("Este sorteio foi cancelado pelo organizador ou um administrador.")
                                .setColor(settings.colors.danger)
                                .setTimestamp();
                            await msg.edit({ content: "Este sorteio foi cancelado.", embeds: [embed], components: [] }).catch(console.error);
                        }
                    }
                }
            } catch (error) {
                console.warn(`[Sorteio Delete] Não foi possível editar a mensagem original do sorteio ${messageId}:`, error);
            }

            await interaction.editReply({ content: `Sorteio para **${giveaway.prize}** (ID: ${messageId}) foi deletado.` });
        }
    },
});

createResponder({
    customId: "giveaway-participate-:giveawayId",
    types: ["button"],
    async run(interaction, { giveawayId }) {
        if (!interaction.inGuild()) return;

        const giveaway = activeGiveaways.get(giveawayId);
        if (!giveaway) {
            await interaction.reply({ content: "Este sorteio não foi encontrado ou já terminou.", ephemeral: true });
            return;
        }

        if (giveaway.ended) {
            await interaction.reply({ content: "Este sorteio já terminou!", ephemeral: true });
            return;
        }

        if (giveaway.participants.has(interaction.user.id)) {
            giveaway.participants.delete(interaction.user.id);
            await interaction.reply({ content: "Você removeu sua participação no sorteio.", ephemeral: true });
        } else {
            giveaway.participants.add(interaction.user.id);
            await interaction.reply({ content: "Você entrou no sorteio! Boa sorte! 🍀", ephemeral: true });
        }

        // Atualizar o contador de participantes no embed
        const message = await interaction.channel?.messages.fetch(giveaway.messageId).catch(() => null);
        if (message) {
            const updatedEmbed = createGiveawayEmbed(giveaway);
            await message.edit({ embeds: [updatedEmbed] });
        }
    }
});