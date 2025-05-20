import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "horoscopo",
	description: "Veja a previsão do seu signo para hoje",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "signo",
			description: "Escolha seu signo do zodíaco",
			type: ApplicationCommandOptionType.String,
			required: true,
			choices: [
				{ name: "Áries (21/03 - 19/04)", value: "aries" },
				{ name: "Touro (20/04 - 20/05)", value: "touro" },
				{ name: "Gêmeos (21/05 - 20/06)", value: "gemeos" },
				{ name: "Câncer (21/06 - 22/07)", value: "cancer" },
				{ name: "Leão (23/07 - 22/08)", value: "leao" },
				{ name: "Virgem (23/08 - 22/09)", value: "virgem" },
				{ name: "Libra (23/09 - 22/10)", value: "libra" },
				{ name: "Escorpião (23/10 - 21/11)", value: "escorpiao" },
				{ name: "Sagitário (22/11 - 21/12)", value: "sagitario" },
				{ name: "Capricórnio (22/12 - 19/01)", value: "capricornio" },
				{ name: "Aquário (20/01 - 18/02)", value: "aquario" },
				{ name: "Peixes (19/02 - 20/03)", value: "peixes" }
			]
		}
	],
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		const signo = interaction.options.getString("signo", true);
		
		// Mapeamento de signos para emojis
		const emojis = {
			aries: "♈",
			touro: "♉",
			gemeos: "♊",
			cancer: "♋",
			leao: "♌",
			virgem: "♍",
			libra: "♎",
			escorpiao: "♏",
			sagitario: "♐",
			capricornio: "♑",
			aquario: "♒",
			peixes: "♓"
		};
		
		// Mapeamento de signos para nomes em português
		const nomes = {
			aries: "Áries",
			touro: "Touro",
			gemeos: "Gêmeos",
			cancer: "Câncer",
			leao: "Leão",
			virgem: "Virgem",
			libra: "Libra",
			escorpiao: "Escorpião",
			sagitario: "Sagitário",
			capricornio: "Capricórnio",
			aquario: "Aquário",
			peixes: "Peixes"
		};
		
		// Previsões para cada signo
		const previsoes = {
			aries: [
				"Hoje é um ótimo dia para iniciar novos projetos. Sua energia está em alta!",
				"Cuidado com decisões impulsivas hoje. Respire fundo antes de agir.",
				"Um novo ciclo se inicia em sua vida. Aproveite as oportunidades que surgirão.",
				"Sua determinação será testada hoje. Mantenha o foco em seus objetivos."
			],
			touro: [
				"Hoje é um bom dia para cuidar das finanças e fazer planejamentos a longo prazo.",
				"Valorize o conforto e os pequenos prazeres da vida hoje.",
				"Sua persistência será recompensada. Continue firme em seus propósitos.",
				"Um momento de tranquilidade se aproxima. Aproveite para relaxar."
			],
			gemeos: [
				"Sua comunicação está favorecida hoje. Ótimo momento para conversas importantes.",
				"Sua curiosidade o levará a descobertas interessantes. Mantenha a mente aberta.",
				"Evite a dispersão hoje. Foque em uma tarefa de cada vez.",
				"Novas ideias surgirão. Anote-as para não esquecer."
			],
			cancer: [
				"Hoje é um dia para se conectar com a família e com suas emoções.",
				"Sua intuição está aguçada. Confie em seus instintos.",
				"Cuide do seu lar e das pessoas que ama. Elas precisam de você.",
				"Um momento de introspecção será benéfico. Ouça sua voz interior."
			],
			leao: [
				"Seu carisma está em alta hoje. Use-o a seu favor em situações sociais.",
				"É um bom momento para se destacar e mostrar seus talentos.",
				"Generosidade será a palavra do dia. Compartilhe o que tem de melhor.",
				"Sua criatividade está em alta. Expresse-se artisticamente."
			],
			virgem: [
				"Hoje é um dia para organizar seus pensamentos e planejar os próximos passos.",
				"Sua atenção aos detalhes será valorizada. Não deixe nada passar despercebido.",
				"Cuide da sua saúde e bem-estar. Pequenas mudanças fazem grande diferença.",
				"Sua capacidade analítica está em alta. Use-a para resolver problemas."
			],
			libra: [
				"Hoje é um dia para buscar equilíbrio em todas as áreas da sua vida.",
				"Relacionamentos estão favorecidos. Aproveite para fortalecer laços.",
				"Sua diplomacia será necessária para resolver conflitos ao seu redor.",
				"Valorize a beleza e a harmonia em tudo que fizer hoje."
			],
			escorpiao: [
				"Hoje é um dia para transformações profundas. Não tenha medo de mudar.",
				"Sua intensidade emocional está em alta. Canalize essa energia para algo produtivo.",
				"Segredos podem vir à tona. Esteja preparado para revelações.",
				"Sua determinação o levará longe. Não desista de seus objetivos."
			],
			sagitario: [
				"Hoje é um dia para expandir horizontes e buscar novos conhecimentos.",
				"Sua sinceridade será valorizada. Expresse o que pensa com tato.",
				"Uma viagem pode surgir de repente. Esteja preparado para aventuras.",
				"Seu otimismo contagiará as pessoas ao seu redor. Espalhe boas energias."
			],
			capricornio: [
				"Hoje é um dia para focar em suas metas profissionais e dar passos concretos.",
				"Sua disciplina será sua maior aliada. Mantenha a constância.",
				"Reconhecimento pelo seu trabalho está a caminho. Continue se esforçando.",
				"Um momento de seriedade é necessário. Evite distrações."
			],
			aquario: [
				"Hoje é um dia para inovar e pensar fora da caixa.",
				"Sua originalidade será sua marca registrada. Não tenha medo de ser diferente.",
				"Causas humanitárias chamam sua atenção. Contribua como puder.",
				"Amizades estão favorecidas. Fortaleça laços com pessoas que compartilham seus ideais."
			],
			peixes: [
				"Hoje é um dia para se conectar com sua espiritualidade e intuição.",
				"Sua sensibilidade está em alta. Use-a para compreender melhor os outros.",
				"Sonhos podem trazer mensagens importantes. Preste atenção neles.",
				"Um momento de introspecção será benéfico. Medite e conecte-se consigo mesmo."
			]
		};
		
		// Seleciona uma previsão aleatória para o signo escolhido
		const previsaoAleatoria = previsoes[signo][Math.floor(Math.random() * previsoes[signo].length)];
		
		// Cores para cada elemento
		const cores = {
			fogo: ["aries", "leao", "sagitario"],
			terra: ["touro", "virgem", "capricornio"],
			ar: ["gemeos", "libra", "aquario"],
			agua: ["cancer", "escorpiao", "peixes"]
		};
		
		// Define a cor do embed baseado no elemento do signo
		let cor = "Purple";
		if (cores.fogo.includes(signo)) cor = "Red";
		else if (cores.terra.includes(signo)) cor = "Green";
		else if (cores.ar.includes(signo)) cor = "Gold";
		else if (cores.agua.includes(signo)) cor = "Blue";
		
		const embed = new EmbedBuilder()
			.setColor(cor)
			.setTitle(`${emojis[signo]} Horóscopo: ${nomes[signo]}`)
			.setDescription(`**Previsão para hoje:**\n\n${previsaoAleatoria}`)
			.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});