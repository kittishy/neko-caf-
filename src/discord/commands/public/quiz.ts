import { createCommand } from "#base";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ComponentType } from "discord.js";

createCommand({
	name: "quiz",
	description: "Teste seus conhecimentos com perguntas de diversas categorias",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		
		// Lista de perguntas de quiz com respostas
		const perguntas = [
			{
				pergunta: "Qual é o maior planeta do Sistema Solar?",
				opcoes: ["Terra", "Júpiter", "Saturno", "Marte"],
				correta: 1, // Júpiter (índice 1)
				categoria: "Astronomia"
			},
			{
				pergunta: "Qual é o país com a maior população do mundo?",
				opcoes: ["Índia", "Estados Unidos", "China", "Brasil"],
				correta: 2, // China (índice 2)
				categoria: "Geografia"
			},
			{
				pergunta: "Quem escreveu 'Dom Quixote'?",
				opcoes: ["Miguel de Cervantes", "William Shakespeare", "Machado de Assis", "Fernando Pessoa"],
				correta: 0, // Miguel de Cervantes (índice 0)
				categoria: "Literatura"
			},
			{
				pergunta: "Qual é o elemento químico com o símbolo 'O'?",
				opcoes: ["Ouro", "Ósmio", "Oxigênio", "Óxido"],
				correta: 2, // Oxigênio (índice 2)
				categoria: "Química"
			},
			{
				pergunta: "Em que ano começou a Primeira Guerra Mundial?",
				opcoes: ["1914", "1918", "1939", "1945"],
				correta: 0, // 1914 (índice 0)
				categoria: "História"
			},
			{
				pergunta: "Qual é o maior oceano do mundo?",
				opcoes: ["Atlântico", "Índico", "Pacífico", "Ártico"],
				correta: 2, // Pacífico (índice 2)
				categoria: "Geografia"
			},
			{
				pergunta: "Quem pintou a 'Mona Lisa'?",
				opcoes: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
				correta: 1, // Leonardo da Vinci (índice 1)
				categoria: "Arte"
			},
			{
				pergunta: "Qual é o menor país do mundo em área territorial?",
				opcoes: ["Mônaco", "Vaticano", "San Marino", "Liechtenstein"],
				correta: 1, // Vaticano (índice 1)
				categoria: "Geografia"
			},
			{
				pergunta: "Qual é o animal terrestre mais rápido do mundo?",
				opcoes: ["Leopardo", "Guepardo", "Leão", "Tigre"],
				correta: 1, // Guepardo (índice 1)
				categoria: "Biologia"
			},
			{
				pergunta: "Qual é a capital do Japão?",
				opcoes: ["Pequim", "Seul", "Tóquio", "Bangkok"],
				correta: 2, // Tóquio (índice 2)
				categoria: "Geografia"
			},
			{
				pergunta: "Quem foi o primeiro homem a pisar na Lua?",
				opcoes: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Alan Shepard"],
				correta: 2, // Neil Armstrong (índice 2)
				categoria: "Astronomia"
			},
			{
				pergunta: "Qual é o maior mamífero terrestre?",
				opcoes: ["Elefante africano", "Rinoceronte", "Hipopótamo", "Girafa"],
				correta: 0, // Elefante africano (índice 0)
				categoria: "Biologia"
			}
		];
		
		// Seleciona uma pergunta aleatória
		const perguntaAleatoria = perguntas[Math.floor(Math.random() * perguntas.length)];
		
		// Cria os botões para as opções
		const row = new ActionRowBuilder();
		
		perguntaAleatoria.opcoes.forEach((opcao, index) => {
			row.addComponents(
				new ButtonBuilder()
					.setCustomId(`quiz_${index}`)
					.setLabel(`${index + 1}. ${opcao}`)
					.setStyle(ButtonStyle.Primary)
			);
		});
		
		// Cria o embed com a pergunta
		const embed = new EmbedBuilder()
			.setColor("#9B59B6") // Roxo
			.setTitle(`🧠 Quiz: ${perguntaAleatoria.categoria}`)
			.setDescription(`**${perguntaAleatoria.pergunta}**\n\nEscolha uma das opções abaixo:`)
			.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
			.setTimestamp();
		
		const message = await interaction.editReply({
			embeds: [embed],
			components: [row]
		});
		
		// Cria o coletor de interações
		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30 * 1000 // 30 segundos para responder
		});
		
		collector.on("collect", async (i) => {
			// Verifica se é o usuário que iniciou o comando
			if (i.user.id !== user.id) {
				await i.reply({
					content: "Você não pode responder a esta pergunta! Use o comando /quiz para iniciar seu próprio quiz.",
					ephemeral: true
				});
				return;
			}
			
			// Obtém a resposta escolhida
			const respostaIndex = parseInt(i.customId.split("_")[1]);
			
			// Verifica se a resposta está correta
			const estaCorreta = respostaIndex === perguntaAleatoria.correta;
			
			// Atualiza o embed com o resultado
			const resultadoEmbed = new EmbedBuilder()
				.setColor(estaCorreta ? "Green" : "Red")
				.setTitle(`🧠 Quiz: ${perguntaAleatoria.categoria}`)
				.setDescription(`**${perguntaAleatoria.pergunta}**\n\n${estaCorreta ? "✅" : "❌"} Você ${estaCorreta ? "acertou" : "errou"}!\n\nA resposta correta era: **${perguntaAleatoria.opcoes[perguntaAleatoria.correta]}**`)
				.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
				.setTimestamp();
			
			await i.update({
				embeds: [resultadoEmbed],
				components: []
			});
			
			collector.stop();
		});
		
		collector.on("end", async (collected) => {
			// Se ninguém respondeu dentro do tempo limite
			if (collected.size === 0) {
				const timeoutEmbed = new EmbedBuilder()
					.setColor("Grey")
					.setTitle(`🧠 Quiz: ${perguntaAleatoria.categoria}`)
					.setDescription(`**${perguntaAleatoria.pergunta}**\n\n⏱️ Tempo esgotado!\n\nA resposta correta era: **${perguntaAleatoria.opcoes[perguntaAleatoria.correta]}**`)
					.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
					.setTimestamp();
				
				await interaction.editReply({
					embeds: [timeoutEmbed],
					components: []
				});
			}
		});
	}
});