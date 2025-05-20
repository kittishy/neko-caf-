import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ComponentType } from "discord.js";

createCommand({
	name: "velha",
	description: "Inicie um jogo da velha com outro usuário",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "oponente",
			description: "O usuário contra quem você deseja jogar",
			type: ApplicationCommandOptionType.User,
			required: true
		}
	],
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		const oponente = interaction.options.getUser("oponente", true);
		
		// Verifica se o usuário está tentando jogar contra si mesmo
		if (oponente.id === user.id) {
			const embed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("❌ Erro")
				.setDescription("Você não pode jogar contra si mesmo!")
				.setFooter({ text: "Neko Café Bot • Jogo da Velha" })
				.setTimestamp();

			await interaction.editReply({
				embeds: [embed]
			});
			return;
		}
		
		// Verifica se o oponente é um bot
		if (oponente.bot) {
			const embed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("❌ Erro")
				.setDescription("Você não pode jogar contra um bot!")
				.setFooter({ text: "Neko Café Bot • Jogo da Velha" })
				.setTimestamp();

			await interaction.editReply({
				embeds: [embed]
			});
			return;
		}
		
		// Cria o tabuleiro inicial
		const tabuleiro = [
			["", "", ""],
			["", "", ""],
			["", "", ""]
		];
		
		// Cria os botões do tabuleiro
		const criarBotoes = () => {
			const rows = [];
			
			for (let i = 0; i < 3; i++) {
				const row = new ActionRowBuilder();
				
				for (let j = 0; j < 3; j++) {
					const button = new ButtonBuilder()
						.setCustomId(`velha_${i}_${j}`)
						.setStyle(ButtonStyle.Secondary)
						.setLabel(tabuleiro[i][j] || "⠀"); // Caractere invisível se vazio
					
					if (tabuleiro[i][j] === "X") {
						button.setStyle(ButtonStyle.Danger).setLabel("X");
					} else if (tabuleiro[i][j] === "O") {
						button.setStyle(ButtonStyle.Success).setLabel("O");
					}
					
					row.addComponents(button);
				}
				
				rows.push(row);
			}
			
			return rows;
		};
		
		// Verifica se há um vencedor
		const verificarVencedor = () => {
			// Verifica linhas
			for (let i = 0; i < 3; i++) {
				if (tabuleiro[i][0] && tabuleiro[i][0] === tabuleiro[i][1] && tabuleiro[i][0] === tabuleiro[i][2]) {
					return tabuleiro[i][0];
				}
			}
			
			// Verifica colunas
			for (let j = 0; j < 3; j++) {
				if (tabuleiro[0][j] && tabuleiro[0][j] === tabuleiro[1][j] && tabuleiro[0][j] === tabuleiro[2][j]) {
					return tabuleiro[0][j];
				}
			}
			
			// Verifica diagonais
			if (tabuleiro[0][0] && tabuleiro[0][0] === tabuleiro[1][1] && tabuleiro[0][0] === tabuleiro[2][2]) {
				return tabuleiro[0][0];
			}
			
			if (tabuleiro[0][2] && tabuleiro[0][2] === tabuleiro[1][1] && tabuleiro[0][2] === tabuleiro[2][0]) {
				return tabuleiro[0][2];
			}
			
			// Verifica empate
			let empate = true;
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					if (!tabuleiro[i][j]) {
						empate = false;
						break;
					}
				}
			}
			
			if (empate) return "empate";
			
			return null;
		};
		
		// Cria o embed inicial
		const embed = new EmbedBuilder()
			.setColor("Blue")
			.setTitle("🎮 Jogo da Velha")
			.setDescription(`${user.toString()} vs ${oponente.toString()}\n\nVez de ${user.toString()} (X)`);
		
		const message = await interaction.editReply({
			embeds: [embed],
			components: criarBotoes()
		});
		
		// Jogador atual (true = jogador 1, false = jogador 2)
		let jogadorAtual = true;
		
		// Cria o coletor de interações
		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 5 * 60 * 1000 // 5 minutos
		});
		
		collector.on("collect", async (i) => {
			// Verifica se é a vez do jogador que clicou
			if ((jogadorAtual && i.user.id !== user.id) || (!jogadorAtual && i.user.id !== oponente.id)) {
				await i.reply({
					content: "Não é sua vez de jogar!",
					ephemeral: true
				});
				return;
			}
			
			// Obtém as coordenadas do botão clicado
			const [, row, col] = i.customId.split("_");
			const r = parseInt(row);
			const c = parseInt(col);
			
			// Verifica se a posição já está ocupada
			if (tabuleiro[r][c]) {
				await i.reply({
					content: "Esta posição já está ocupada!",
					ephemeral: true
				});
				return;
			}
			
			// Marca a posição no tabuleiro
			tabuleiro[r][c] = jogadorAtual ? "X" : "O";
			
			// Verifica se há um vencedor
			const vencedor = verificarVencedor();
			
			// Atualiza o embed
			if (vencedor === "X") {
				embed.setDescription(`${user.toString()} vs ${oponente.toString()}\n\n🎉 **${user.toString()} venceu!**`);
				embed.setColor("Green");
				collector.stop();
			} else if (vencedor === "O") {
				embed.setDescription(`${user.toString()} vs ${oponente.toString()}\n\n🎉 **${oponente.toString()} venceu!**`);
				embed.setColor("Green");
				collector.stop();
			} else if (vencedor === "empate") {
				embed.setDescription(`${user.toString()} vs ${oponente.toString()}\n\n🤝 **Empate!**`);
				embed.setColor("Yellow");
				collector.stop();
			} else {
				// Alterna o jogador atual
				jogadorAtual = !jogadorAtual;
				embed.setDescription(`${user.toString()} vs ${oponente.toString()}\n\nVez de ${jogadorAtual ? user.toString() : oponente.toString()} (${jogadorAtual ? "X" : "O"})`);
			}
			
			// Atualiza a mensagem
			await i.update({
				embeds: [embed],
				components: criarBotoes()
			});
		});
		
		collector.on("end", async (collected, reason) => {
			if (reason === "time") {
				embed.setDescription(`${user.toString()} vs ${oponente.toString()}\n\n⏱️ **Tempo esgotado!**`);
				embed.setColor("Grey");
				
				await interaction.editReply({
					embeds: [embed],
					components: []
				});
			}
		});
	}
});