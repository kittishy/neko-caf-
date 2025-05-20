import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "abraco",
	description: "Dê um abraço em alguém do servidor",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "usuario",
			description: "O usuário que você deseja abraçar",
			type: ApplicationCommandOptionType.User,
			required: true
		},
		{
			name: "mensagem",
			description: "Uma mensagem personalizada para enviar junto com o abraço",
			type: ApplicationCommandOptionType.String,
			required: false
		}
	],
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		const targetUser = interaction.options.getUser("usuario", true);
		const mensagem = interaction.options.getString("mensagem") || "Sem mensagem";
		
		// Lista de mensagens de abraço aleatórias
		const mensagensAbraco = [
			"deu um abraço apertado em",
			"abraçou carinhosamente",
			"envolveu em um abraço caloroso",
			"deu um abraço de urso em",
			"abraçou com muito carinho"
		];
		
		// Seleciona uma mensagem aleatória
		const mensagemAleatoria = mensagensAbraco[Math.floor(Math.random() * mensagensAbraco.length)];
		
		const embed = new EmbedBuilder()
			.setColor("LuminousVividPink")
			.setTitle("🤗 Abraço!")
			.setDescription(`**${user.toString()}** ${mensagemAleatoria} **${targetUser.toString()}**!`)
			.addFields(
				{ name: "Mensagem", value: mensagem }
			)
			.setFooter({ text: "Neko Café Bot • Interações" })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});