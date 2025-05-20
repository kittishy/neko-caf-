import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ComponentType } from "discord.js";

createCommand({
	name: "ppt",
	description: "Jogue pedra, papel e tesoura contra o bot ou outro usuário",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "oponente",
			description: "O usuário contra quem você deseja jogar (opcional)",
			type: ApplicationCommandOptionType.User,
			required: false
		}
	],
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		const oponente = interaction.options.getUser("oponente");
		
		// Verifica se o usuário está tentando jogar contra si mesmo
		if (oponente && oponente.id === user.id) {
			const embed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("❌ Erro")
				.setDescription("Você não pode jogar contra si mesmo!")
				.setFooter({ text: "Neko Café Bot • Pedra, Papel e Tesoura" })
				.setTimestamp();

			await interaction.editReply({
				embeds: [embed]
			});
			return;
		}
		
		// Verifica se o oponente é um bot
		if (oponente && oponente.bot) {
			const embed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("❌ Erro")
				.setDescription("Você não pode jogar contra um bot!")
				.setFooter({ text: "Neko Café Bot • Pedra, Papel e Tesoura" })
				.setTimestamp();

			await interaction.editReply({
				embeds: [embed]
			});
			return;
		}
		
		// Cria os botões de escolha
		const criarBotoes = () => {
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId("ppt_pedra")
						.setLabel("Pedra 🪨")
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId("ppt_papel")
						.setLabel("Papel 📄")
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId("ppt_tesoura")
						.setLabel("Tesoura ✂️")
						.setStyle(ButtonStyle.Primary)
				);
			
			return [row];
		};
		
		// Determina o vencedor
		const determinarVencedor = (escolha1, escolha2) => {
			if (escolha1 === escolha2) return "empate";
			
			if (
				(escolha1 === "pedra" && escolha2 === "tesoura") ||
				(escolha1 === "papel" && escolha2 === "pedra") ||
				(escolha1 === "tesoura" && escolha2 === "papel")
			) {
				return "jogador1";
			}
			
			return "jogador2";
		};
		
		// Emoji para cada escolha
		const emojis = {
			pedra: "🪨",
			papel: "📄",
			tesoura: "✂️"
		};
		
		// Cria o embed inicial
		const embed = new EmbedBuilder()
			.setColor("Blue")
			.setTitle("🎮 Pedra, Papel e Tesoura")
			.setDescription(oponente ? 
				`${user.toString()} desafiou ${oponente.toString()} para uma partida!\n\n${user.toString()}, escolha sua jogada:` : 
				`${user.toString()}, escolha sua jogada para jogar contra o bot:`);
		
		const message = await interaction.editReply({
			embeds: [embed],
			components: criarBotoes()
		});
		
		// Cria o coletor de interações
		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 60 * 1000 // 1 minuto
		});
		
		// Armazena a escolha do jogador 1
		let escolhaJogador1 = null;
		
		collector.on("collect", async (i) => {
			// Verifica se é o jogador correto
			if (i.user.id !== user.id && (!oponente || i.user.id !== oponente.id)) {
				await i.reply({
					content: "Você não está participando deste jogo!",
					ephemeral: true
				});
				return;
			}
			
			// Obtém a escolha do botão clicado
			const escolha = i.customId.split("_")[1];
			
			// Se for o jogador 1
			if (i.user.id === user.id) {
				escolhaJogador1 = escolha;
				
				// Se estiver jogando contra o bot
				if (!oponente) {
					// Bot faz uma escolha aleatória
					const escolhasBot = ["pedra", "papel", "tesoura"];
					const escolhaBot = escolhasBot[Math.floor(Math.random() * escolhasBot.length)];
					
					// Determina o vencedor
					const resultado = determinarVencedor(escolhaJogador1, escolhaBot);
					
					// Atualiza o embed com o resultado
					embed.setDescription(`${user.toString()} escolheu ${emojis[escolhaJogador1]} **${escolhaJogador1}**\nO bot escolheu ${emojis[escolhaBot]} **${escolhaBot}**\n\n`);
					
					if (resultado === "empate") {
						embed.setColor("Yellow");
						embed.setDescription(embed.data.description + "🤝 **Empate!**");
					} else if (resultado === "jogador1") {
						embed.setColor("Green");
						embed.setDescription(embed.data.description + `🎉 **${user.toString()} venceu!**`);
					} else {
						embed.setColor("Red");
						embed.setDescription(embed.data.description + "😢 **O bot venceu!**");
					}
					
					// Atualiza a mensagem e encerra o coletor
					await i.update({
						embeds: [embed],
						components: []
					});
					
					collector.stop();
				} else {
					// Atualiza o embed para o jogador 2
					embed.setDescription(`${user.toString()} já fez sua escolha!\n\n${oponente.toString()}, é sua vez de escolher:`);
					
					await i.update({
						embeds: [embed]
					});
				}
			} 
			// Se for o jogador 2 e o jogador 1 já escolheu
			else if (oponente && i.user.id === oponente.id && escolhaJogador1) {
				const escolhaJogador2 = escolha;
				
				// Determina o vencedor
				const resultado = determinarVencedor(escolhaJogador1, escolhaJogador2);
				
				// Atualiza o embed com o resultado
				embed.setDescription(`${user.toString()} escolheu ${emojis[escolhaJogador1]} **${escolhaJogador1}**\n${oponente.toString()} escolheu ${emojis[escolhaJogador2]} **${escolhaJogador2}**\n\n`);
				
				if (resultado === "empate") {
					embed.setColor("Yellow");
					embed.setDescription(embed.data.description + "🤝 **Empate!**");
				} else if (resultado === "jogador1") {
					embed.setColor("Green");
					embed.setDescription(embed.data.description + `🎉 **${user.toString()} venceu!**`);
				} else {
					embed.setColor("Green");
					embed.setDescription(embed.data.description + `🎉 **${oponente.toString()} venceu!**`);
				}
				
				// Atualiza a mensagem e encerra o coletor
				await i.update({
					embeds: [embed],
					components: []
				});
				
				collector.stop();
			}
		});
		
		collector.on("end", async (collected, reason) => {
			if (reason === "time" && collected.size === 0) {
				embed.setColor("Grey");
				embed.setDescription("⏱️ **Tempo esgotado!** Ninguém fez uma escolha.");
				
				await interaction.editReply({
					embeds: [embed],
					components: []
				});
			} else if (reason === "time" && oponente && !collected.some(i => i.user.id === oponente.id)) {
				embed.setColor("Grey");
				embed.setDescription(`⏱️ **Tempo esgotado!** ${oponente.toString()} não respondeu ao desafio.`);
				
				await interaction.editReply({
					embeds: [embed],
					components: []
				});
			}
		});
	}
});