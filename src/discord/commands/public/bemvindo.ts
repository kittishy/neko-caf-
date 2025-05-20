import { createCommand } from "#base";
import { createRow } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

createCommand({
	name: "bemvindo",
	description: "Envia uma mensagem de boas-vindas ao usuário",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		const { user } = interaction;

		const embed = new EmbedBuilder()
			.setColor("Random")
			.setTitle("🎉 Bem-vindo ao Neko Café! 🐱")
			.setDescription(`Olá ${user.toString()}, seja bem-vindo ao nosso servidor! Estamos felizes em ter você aqui.`)
			.addFields(
				{ name: "📜 Regras", value: "Por favor, leia nossas regras para uma convivência harmoniosa." },
				{ name: "🎮 Diversão", value: "Use nossos comandos para se divertir e interagir com outros membros!" }
			)
			.setFooter({ text: "Neko Café Bot • Feito com 💖" })
			.setTimestamp();

		const row = createRow(
			new ButtonBuilder({ 
				customId: `ajuda/${new Date().toISOString()}`,
				label: "Preciso de Ajuda",
				style: ButtonStyle.Primary,
			}),
			new ButtonBuilder({ 
				customId: `regras/${new Date().toISOString()}`,
				label: "Ver Regras",
				style: ButtonStyle.Secondary,
			})
		);

		await interaction.reply({
			ephemeral: true,
			embeds: [embed],
			components: [row],
		});
	}
});