import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "piada",
	description: "Receba uma piada aleatória para se divertir",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		
		// Lista de piadas
		const piadas = [
			{
				pergunta: "Por que o computador foi ao médico?",
				resposta: "Porque estava com vírus!"
			},
			{
				pergunta: "O que o gato faz quando está na internet?",
				resposta: "Ele navega no miau miau miau!"
			},
			{
				pergunta: "Por que o livro de matemática ficou triste?",
				resposta: "Porque tinha muitos problemas!"
			},
			{
				pergunta: "O que o zero disse para o oito?",
				resposta: "Que cinto bonito você está usando!"
			},
			{
				pergunta: "Por que a plantinha não conseguia usar o computador?",
				resposta: "Porque ela esqueceu a senha-flora!"
			},
			{
				pergunta: "O que o pato disse para a pata?",
				resposta: "Vem quá!"
			},
			{
				pergunta: "Por que o jacaré não liga o computador?",
				resposta: "Porque ele tem medo do byte!"
			},
			{
				pergunta: "Qual é o contrário de volátil?",
				resposta: "Vem cá sobrinho!"
			},
			{
				pergunta: "Por que o espantalho ganhou um prêmio?",
				resposta: "Porque ele era excelente no seu campo!"
			},
			{
				pergunta: "O que acontece quando chove na Inglaterra?",
				resposta: "Vira InglaTerra!"
			}
		];
		
		// Seleciona uma piada aleatória
		const piadaAleatoria = piadas[Math.floor(Math.random() * piadas.length)];
		
		const embed = new EmbedBuilder()
			.setColor("Gold")
			.setTitle("😂 Hora da Piada!")
			.addFields(
				{ name: piadaAleatoria.pergunta, value: "..." },
				{ name: "Resposta", value: `||${piadaAleatoria.resposta}||` }
			)
			.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});