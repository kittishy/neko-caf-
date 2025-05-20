import { db } from "#database";
import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "trabalhar",
	description: "Trabalhe para ganhar moedas diariamente",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		await interaction.deferReply();

		const { user, member } = interaction;
		
		// Busca ou cria o documento do membro no banco de dados
		const memberData = await db.members.get(member);
		
		// Verifica se o usuário já trabalhou nas últimas 24 horas
		const ultimoTrabalho = memberData.lastWork || 0;
		const agora = Date.now();
		const tempoPassado = agora - ultimoTrabalho;
		const tempoRestante = 24 * 60 * 60 * 1000 - tempoPassado; // 24 horas em milissegundos
		
		if (tempoPassado < 24 * 60 * 60 * 1000) {
			// Ainda não pode trabalhar novamente
			const horas = Math.floor(tempoRestante / (60 * 60 * 1000));
			const minutos = Math.floor((tempoRestante % (60 * 60 * 1000)) / (60 * 1000));
			
			const embed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("⏰ Tempo de Descanso")
				.setDescription(`Você já trabalhou hoje! Volte em **${horas}h ${minutos}m**.`)
				.setFooter({ text: "Neko Café Bot • Sistema de Trabalho" })
				.setTimestamp();

			await interaction.editReply({
				embeds: [embed]
			});
			return;
		}
		
		// Lista de trabalhos possíveis
		const trabalhos = [
			{ nome: "Garçom no Neko Café", ganho: { min: 50, max: 150 } },
			{ nome: "Entregador de Encomendas", ganho: { min: 70, max: 180 } },
			{ nome: "Cuidador de Nekos", ganho: { min: 100, max: 200 } },
			{ nome: "Barista", ganho: { min: 80, max: 170 } },
			{ nome: "Faxineiro do Café", ganho: { min: 60, max: 160 } }
		];
		
		// Seleciona um trabalho aleatório
		const trabalhoAleatorio = trabalhos[Math.floor(Math.random() * trabalhos.length)];
		
		// Calcula o ganho aleatório dentro do intervalo do trabalho
		const ganho = Math.floor(Math.random() * (trabalhoAleatorio.ganho.max - trabalhoAleatorio.ganho.min + 1)) + trabalhoAleatorio.ganho.min;
		
		// Atualiza o saldo e a data do último trabalho
		memberData.wallet.coins += ganho;
		memberData.lastWork = agora;
		await memberData.save();
		
		const embed = new EmbedBuilder()
			.setColor("Green")
			.setTitle("💼 Trabalho Concluído!")
			.setDescription(`**${user.toString()}** trabalhou como **${trabalhoAleatorio.nome}** e ganhou **${ganho} moedas**!`)
			.addFields(
				{ name: "Saldo Atual", value: `${memberData.wallet.coins} moedas` }
			)
			.setFooter({ text: "Neko Café Bot • Sistema de Trabalho" })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});