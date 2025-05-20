import { db } from "#database";
import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "perfil",
	description: "Veja seu perfil ou o perfil de outro usuário",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "usuario",
			description: "O usuário cujo perfil você deseja ver",
			type: ApplicationCommandOptionType.User,
			required: false
		}
	],
	async run(interaction) {
		await interaction.deferReply();

		const { guild } = interaction;
		const targetUser = interaction.options.getUser("usuario") || interaction.user;
		const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
		
		if (!targetMember) {
			await interaction.editReply({ content: "Usuário não encontrado no servidor." });
			return;
		}
		
		// Busca ou cria o documento do membro no banco de dados
		const memberData = await db.members.get(targetMember);
		
		// Calcula o tempo no servidor
		const joinedAt = targetMember.joinedAt || new Date();
		const diasNoServidor = Math.floor((Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24));
		
		// Obtém os itens do inventário (se existirem)
		const inventario = memberData.inventory || [];
		const itensTexto = inventario.length > 0 
			? inventario.map(item => `• ${item.nome}`).join("\n")
			: "Nenhum item no inventário";
		
		// Obtém a data do último trabalho (se existir)
		const ultimoTrabalho = memberData.lastWork 
			? new Date(memberData.lastWork).toLocaleDateString("pt-BR")
			: "Nunca trabalhou";
		
		const embed = new EmbedBuilder()
			.setColor("Blurple")
			.setAuthor({ name: targetUser.username, iconURL: targetUser.displayAvatarURL() })
			.setTitle("📋 Perfil do Usuário")
			.setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
			.addFields(
				{ name: "💰 Moedas", value: `${memberData.wallet.coins}`, inline: true },
				{ name: "📅 No servidor há", value: `${diasNoServidor} dias`, inline: true },
				{ name: "⏰ Último trabalho", value: ultimoTrabalho, inline: true },
				{ name: "🎒 Inventário", value: itensTexto }
			)
			.setFooter({ text: "Neko Café Bot • Sistema de Perfil" })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});