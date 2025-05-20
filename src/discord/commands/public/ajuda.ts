import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "ajuda",
	description: "Mostra a lista de comandos disponíveis",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		const { user } = interaction;

		const embed = new EmbedBuilder()
			.setColor("Purple")
			.setTitle("📚 Comandos do Neko Café Bot")
			.setDescription(`Olá ${user.toString()}, aqui estão os comandos disponíveis:`)
			.addFields(
				// Comandos de Utilidade
				{ name: "📋 Utilidade", value: "​" },
				{ name: "/bemvindo", value: "Exibe uma mensagem de boas-vindas personalizada" },
				{ name: "/ajuda", value: "Mostra esta lista de comandos" },
				{ name: "/ping", value: "Verifica se o bot está online e funcionando" },
				{ name: "/clima", value: "Veja a previsão do tempo para uma cidade" },
				
				// Comandos de Economia
				{ name: "💰 Economia", value: "​" },
				{ name: "/carteira", value: "Verifica seu saldo de moedas no servidor" },
				{ name: "/trabalhar", value: "Trabalhe para ganhar moedas diariamente" },
				{ name: "/loja", value: "Acesse a loja para comprar itens com suas moedas" },
				{ name: "/transferir", value: "Transfira moedas para outro usuário" },
				
				// Comandos de Diversão
				{ name: "🎮 Diversão", value: "​" },
				{ name: "/8ball", value: "Faça uma pergunta à bola mágica e receba uma resposta" },
				{ name: "/abraco", value: "Dê um abraço em alguém do servidor" },
				{ name: "/citacao", value: "Receba uma citação motivacional para inspirar seu dia" },
				{ name: "/curiosidade", value: "Receba uma curiosidade aleatória e interessante" },
				{ name: "/dados", value: "Lance dados de RPG (d4, d6, d8, d10, d12, d20, d100)" },
				{ name: "/fato", value: "Receba um fato aleatório e interessante sobre diversos temas" },
				{ name: "/horoscopo", value: "Veja a previsão do seu signo para hoje" },
				{ name: "/meme", value: "Receba um meme aleatório para se divertir" },
				{ name: "/piada", value: "Receba uma piada aleatória para se divertir" },
				{ name: "/ppt", value: "Jogue pedra, papel e tesoura contra o bot ou outro usuário" },
				{ name: "/quiz", value: "Teste seus conhecimentos com perguntas de diversas categorias" },
				{ name: "/sorteio", value: "Realize um sorteio entre vários itens ou participantes" },
				{ name: "/velha", value: "Inicie um jogo da velha com outro usuário" },
				
				// Comandos Pessoais
				{ name: "👤 Pessoal", value: "​" },
				{ name: "/perfil", value: "Veja seu perfil ou o perfil de outro usuário" },
				{ name: "/diario", value: "Registre uma mensagem no seu diário pessoal" }
			)
			.setFooter({ text: "Neko Café Bot • Desenvolvido com 💖" })
			.setTimestamp();

		await interaction.reply({
			ephemeral: true,
			embeds: [embed]
		});
	}
});