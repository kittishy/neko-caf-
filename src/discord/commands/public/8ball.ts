import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "8ball",
	description: "Faça uma pergunta à bola mágica e receba uma resposta",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "pergunta",
			description: "A pergunta que você deseja fazer",
			type: ApplicationCommandOptionType.String,
			required: true
		}
	],
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		const pergunta = interaction.options.getString("pergunta", true);
		
		// Lista de respostas possíveis da bola mágica
		const respostas = [
			"Sim, com certeza!",
			"É decididamente assim.",
			"Sem dúvida!",
			"Sim, definitivamente.",
			"Você pode contar com isso.",
			"Como eu vejo, sim.",
			"Provavelmente.",
			"As perspectivas são boas.",
			"Sim.",
			"Sinais apontam que sim.",
			"Resposta nebulosa, tente novamente.",
			"Pergunte novamente mais tarde.",
			"Melhor não te dizer agora.",
			"Não posso prever agora.",
			"Concentre-se e pergunte novamente.",
			"Não conte com isso.",
			"Minha resposta é não.",
			"Minhas fontes dizem que não.",
			"As perspectivas não são tão boas.",
			"Muito duvidoso."
		];
		
		// Seleciona uma resposta aleatória
		const respostaAleatoria = respostas[Math.floor(Math.random() * respostas.length)];
		
		const embed = new EmbedBuilder()
			.setColor("DarkBlue")
			.setTitle("🔮 Bola Mágica")
			.setDescription(`**${user.toString()}** perguntou: *${pergunta}*`)
			.addFields(
				{ name: "A bola mágica responde", value: `**${respostaAleatoria}**` }
			)
			.setFooter({ text: "Neko Café Bot • Diversão" })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});