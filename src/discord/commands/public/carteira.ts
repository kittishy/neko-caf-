import { db } from "#database";
import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "carteira",
	description: "Veja seu saldo de moedas",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		await interaction.deferReply();

		const { user, member } = interaction;
		
		// Busca ou cria o documento do membro no banco de dados
		const memberData = await db.members.get(member);
		const coins = memberData.wallet.coins;

		const embed = new EmbedBuilder()
			.setColor("Gold")
			.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
			.setTitle("💰 Carteira")
			.setDescription(`Você possui **${coins} moedas** em sua carteira!`)
			.setFooter({ text: "Neko Café Bot • Economia" })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});