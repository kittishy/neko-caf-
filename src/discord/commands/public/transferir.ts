import { db } from "#database";
import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "transferir",
	description: "Transfira moedas para outro usuário",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "usuario",
			description: "O usuário para quem você deseja transferir moedas",
			type: ApplicationCommandOptionType.User,
			required: true
		},
		{
			name: "quantidade",
			description: "A quantidade de moedas que você deseja transferir",
			type: ApplicationCommandOptionType.Integer,
			minValue: 1,
			required: true
		}
	],
	async run(interaction) {
		await interaction.deferReply();

		const { user, member, guild } = interaction;
		const targetUser = interaction.options.getUser("usuario", true);
		const quantidade = interaction.options.getInteger("quantidade", true);
		
		// Verifica se o usuário está tentando transferir para si mesmo
		if (targetUser.id === user.id) {
			const embed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("❌ Erro na Transferência")
				.setDescription("Você não pode transferir moedas para si mesmo!")
				.setFooter({ text: "Neko Café Bot • Sistema de Economia" })
				.setTimestamp();

			await interaction.editReply({
				embeds: [embed]
			});
			return;
		}
		
		// Busca o membro alvo no servidor
		const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
		
		if (!targetMember) {
			await interaction.editReply({ content: "Usuário não encontrado no servidor." });
			return;
		}
		
		// Busca ou cria os documentos dos membros no banco de dados
		const senderData = await db.members.get(member);
		const receiverData = await db.members.get(targetMember);
		
		// Verifica se o remetente tem moedas suficientes
		if (senderData.wallet.coins < quantidade) {
			const embed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("❌ Saldo Insuficiente")
				.setDescription(`Você não tem moedas suficientes para transferir **${quantidade} moedas**.`)
				.addFields(
					{ name: "Seu saldo", value: `${senderData.wallet.coins} moedas` },
					{ name: "Faltam", value: `${quantidade - senderData.wallet.coins} moedas` }
				)
				.setFooter({ text: "Neko Café Bot • Use /trabalhar para ganhar mais moedas" })
				.setTimestamp();

			await interaction.editReply({
				embeds: [embed]
			});
			return;
		}
		
		// Processa a transferência
		senderData.wallet.coins -= quantidade;
		receiverData.wallet.coins += quantidade;
		
		// Salva as alterações no banco de dados
		await senderData.save();
		await receiverData.save();
		
		const embed = new EmbedBuilder()
			.setColor("Green")
			.setTitle("✅ Transferência Realizada!")
			.setDescription(`Você transferiu **${quantidade} moedas** para **${targetUser.toString()}**!`)
			.addFields(
				{ name: "Seu saldo atual", value: `${senderData.wallet.coins} moedas` }
			)
			.setFooter({ text: "Neko Café Bot • Sistema de Economia" })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});