import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "dados",
	description: "Lance dados de RPG (d4, d6, d8, d10, d12, d20, d100)",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "tipo",
			description: "Tipo de dado a ser lançado",
			type: ApplicationCommandOptionType.String,
			required: true,
			choices: [
				{ name: "d4 - Dado de 4 lados", value: "d4" },
				{ name: "d6 - Dado de 6 lados", value: "d6" },
				{ name: "d8 - Dado de 8 lados", value: "d8" },
				{ name: "d10 - Dado de 10 lados", value: "d10" },
				{ name: "d12 - Dado de 12 lados", value: "d12" },
				{ name: "d20 - Dado de 20 lados", value: "d20" },
				{ name: "d100 - Dado percentual", value: "d100" }
			]
		},
		{
			name: "quantidade",
			description: "Quantidade de dados a serem lançados (máximo 10)",
			type: ApplicationCommandOptionType.Integer,
			required: false,
			minValue: 1,
			maxValue: 10
		},
		{
			name: "modificador",
			description: "Modificador a ser adicionado ao resultado final (ex: +2, -1)",
			type: ApplicationCommandOptionType.Integer,
			required: false
		}
	],
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		const tipo = interaction.options.getString("tipo", true);
		const quantidade = interaction.options.getInteger("quantidade") || 1;
		const modificador = interaction.options.getInteger("modificador") || 0;
		
		// Determina o número máximo de faces do dado
		const faces = parseInt(tipo.substring(1));
		
		// Lança os dados
		const resultados = [];
		let soma = 0;
		
		for (let i = 0; i < quantidade; i++) {
			const resultado = Math.floor(Math.random() * faces) + 1;
			resultados.push(resultado);
			soma += resultado;
		}
		
		// Adiciona o modificador à soma
		const total = soma + modificador;
		
		// Cria a descrição dos resultados
		let descricao = `🎲 **Resultado${quantidade > 1 ? "s" : ""}:** ${resultados.join(", ")}\n`;
		
		if (quantidade > 1) {
			descricao += `\n📊 **Soma dos dados:** ${soma}`;
		}
		
		if (modificador !== 0) {
			descricao += `\n🔸 **Modificador:** ${modificador > 0 ? "+" + modificador : modificador}`;
			descricao += `\n\n🔢 **Total final:** ${total}`;
		} else if (quantidade > 1) {
			descricao += `\n\n🔢 **Total final:** ${total}`;
		}
		
		// Determina a cor do embed baseado no tipo de dado
		let cor;
		switch (tipo) {
			case "d4": cor = "#FF5733"; break; // Vermelho
			case "d6": cor = "#33FF57"; break; // Verde
			case "d8": cor = "#3357FF"; break; // Azul
			case "d10": cor = "#F033FF"; break; // Rosa
			case "d12": cor = "#FF9033"; break; // Laranja
			case "d20": cor = "#33FFF9"; break; // Ciano
			case "d100": cor = "#9033FF"; break; // Roxo
			default: cor = "Random";
		}
		
		// Mensagens especiais para resultados críticos no d20
		let mensagemCritica = "";
		if (tipo === "d20" && quantidade === 1) {
			if (resultados[0] === 20) {
				mensagemCritica = "\n\n✨ **SUCESSO CRÍTICO!** ✨";
			} else if (resultados[0] === 1) {
				mensagemCritica = "\n\n💥 **FALHA CRÍTICA!** 💥";
			}
		}
		
		const embed = new EmbedBuilder()
			.setColor(cor)
			.setTitle(`🎲 Rolagem de Dados: ${quantidade}${tipo.toUpperCase()}${modificador !== 0 ? (modificador > 0 ? " +" + modificador : " " + modificador) : ""}`)
			.setDescription(descricao + mensagemCritica)
			.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});