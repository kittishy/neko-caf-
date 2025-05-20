import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "clima",
	description: "Veja a previsão do tempo para uma cidade",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "cidade",
			description: "Nome da cidade para verificar o clima",
			type: ApplicationCommandOptionType.String,
			required: true
		}
	],
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		const cidade = interaction.options.getString("cidade", true);
		
		// Simulação de dados climáticos (em uma implementação real, você usaria uma API de clima)
		const climas = [
			{ condicao: "Ensolarado", temperatura: { min: 25, max: 32 }, umidade: 45, icone: "☀️" },
			{ condicao: "Parcialmente Nublado", temperatura: { min: 20, max: 28 }, umidade: 60, icone: "⛅" },
			{ condicao: "Nublado", temperatura: { min: 18, max: 24 }, umidade: 70, icone: "☁️" },
			{ condicao: "Chuvoso", temperatura: { min: 15, max: 22 }, umidade: 85, icone: "🌧️" },
			{ condicao: "Tempestade", temperatura: { min: 14, max: 20 }, umidade: 90, icone: "⛈️" },
			{ condicao: "Nevando", temperatura: { min: -2, max: 5 }, umidade: 80, icone: "❄️" }
		];
		
		// Seleciona um clima aleatório
		const climaAleatorio = climas[Math.floor(Math.random() * climas.length)];
		
		const embed = new EmbedBuilder()
			.setColor("Blue")
			.setTitle(`${climaAleatorio.icone} Clima em ${cidade}`)
			.setDescription(`Previsão do tempo para hoje em **${cidade}**`)
			.addFields(
				{ name: "Condição", value: climaAleatorio.condicao, inline: true },
				{ name: "Temperatura", value: `${climaAleatorio.temperatura.min}°C - ${climaAleatorio.temperatura.max}°C`, inline: true },
				{ name: "Umidade", value: `${climaAleatorio.umidade}%`, inline: true }
			)
			.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});