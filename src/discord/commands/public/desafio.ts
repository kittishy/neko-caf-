import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "desafio",
	description: "Receba um desafio divertido ou rápido para fazer agora!",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		await interaction.deferReply();
		const { user } = interaction;
		const desafios = [
			"Envie um emoji aleatório no chat agora!",
			"Conte uma curiosidade sobre você para alguém do servidor.",
			"Mude seu apelido para algo engraçado por 10 minutos.",
			"Desafie alguém para um duelo de piadas!",
			"Envie uma mensagem positiva para alguém do servidor.",
			"Faça um elogio sincero para o próximo usuário que falar no chat.",
			"Compartilhe uma música que você gosta no chat.",
			"Fique em silêncio no chat por 5 minutos (se conseguir!).",
			"Desenhe algo e envie uma foto no chat (pode ser no paint!).",
			"Inicie uma votação sobre um tema aleatório no chat."
		];
		const desafioAleatorio = desafios[Math.floor(Math.random() * desafios.length)];
		const embed = new EmbedBuilder()
			.setColor("Red")
			.setTitle("⚡ Desafio Rápido!")
			.setDescription(desafioAleatorio)
			.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
			.setTimestamp();
		await interaction.editReply({ embeds: [embed] });
	}
});