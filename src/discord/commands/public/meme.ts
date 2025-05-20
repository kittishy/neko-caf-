import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "meme",
	description: "Receba um meme aleatório para se divertir",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		
		// Lista de memes com título e URL da imagem
		const memes = [
			{
				titulo: "Quando o código funciona de primeira",
				imagem: "https://i.imgur.com/QDs7nzF.jpg"
			},
			{
				titulo: "Programando às 3 da manhã",
				imagem: "https://i.imgur.com/hLOKu8L.jpg"
			},
			{
				titulo: "Quando alguém mexe no seu código",
				imagem: "https://i.imgur.com/oUdWMtJ.jpg"
			},
			{
				titulo: "Café é vida",
				imagem: "https://i.imgur.com/NVGWToF.jpg"
			},
			{
				titulo: "Gatos sendo gatos",
				imagem: "https://i.imgur.com/WSHkHuP.jpg"
			},
			{
				titulo: "Dia de folga",
				imagem: "https://i.imgur.com/V1RLPTl.jpg"
			},
			{
				titulo: "Expectativa vs Realidade",
				imagem: "https://i.imgur.com/8hpDwVe.jpg"
			},
			{
				titulo: "Segunda-feira",
				imagem: "https://i.imgur.com/FWPIR7q.jpg"
			}
		];
		
		// Seleciona um meme aleatório
		const memeAleatorio = memes[Math.floor(Math.random() * memes.length)];
		
		const embed = new EmbedBuilder()
			.setColor("Random")
			.setTitle(`😂 ${memeAleatorio.titulo}`)
			.setImage(memeAleatorio.imagem)
			.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});