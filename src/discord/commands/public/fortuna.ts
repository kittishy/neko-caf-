import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "fortuna",
	description: "Descubra sua fortuna do dia",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		
		// Lista de fortunas possíveis
		const fortunas = [
			"Hoje é um ótimo dia para começar novos projetos.",
			"Uma surpresa agradável está a caminho.",
			"Sua criatividade estará em alta hoje, aproveite para expressar suas ideias.",
			"Um amigo precisará do seu apoio em breve.",
			"Cuidado com decisões financeiras precipitadas.",
			"Uma oportunidade única surgirá, esteja atento aos sinais.",
			"Alguém do seu passado pode reaparecer com boas notícias.",
			"Sua energia positiva atrairá pessoas interessantes hoje.",
			"Um pequeno gesto de gentileza fará uma grande diferença para alguém.",
			"É um bom momento para resolver mal-entendidos.",
			"Sua persistência será recompensada em breve.",
			"Uma mudança inesperada trará benefícios a longo prazo.",
			"Confie mais na sua intuição para tomar decisões importantes.",
			"Um novo hobby pode trazer alegria e relaxamento para sua vida.",
			"Cuide da sua saúde hoje, seu corpo agradecerá.",
			"Uma viagem pode estar no seu futuro próximo.",
			"Compartilhe seus conhecimentos, alguém precisa do que você sabe.",
			"Um sonho antigo tem grandes chances de se realizar agora.",
			"Sua sorte está em alta, mas não dependa apenas dela.",
			"É um bom dia para expressar seus sentimentos a alguém especial."
		];
		
		// Seleciona uma fortuna aleatória
		const fortunaAleatoria = fortunas[Math.floor(Math.random() * fortunas.length)];
		
		// Níveis de sorte
		const niveisDesorte = ["Baixa ⭐", "Moderada ⭐⭐", "Boa ⭐⭐⭐", "Muito Boa ⭐⭐⭐⭐", "Excelente ⭐⭐⭐⭐⭐"];
		const sorteDodia = niveisDesorte[Math.floor(Math.random() * niveisDesorte.length)];
		
		const embed = new EmbedBuilder()
			.setColor("Gold")
			.setTitle("🔮 Sua Fortuna do Dia")
			.setDescription(`${fortunaAleatoria}`)
			.addFields(
				{ name: "Nível de Sorte", value: sorteDodia }
			)
			.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});