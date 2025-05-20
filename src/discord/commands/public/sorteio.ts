import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "sorteio",
	description: "Realize um sorteio entre vários itens ou participantes",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "itens",
			description: "Lista de itens ou participantes separados por vírgula",
			type: ApplicationCommandOptionType.String,
			required: true
		},
		{
			name: "quantidade",
			description: "Quantidade de itens a serem sorteados (padrão: 1)",
			type: ApplicationCommandOptionType.Integer,
			minValue: 1,
			required: false
		},
		{
			name: "titulo",
			description: "Título do sorteio (opcional)",
			type: ApplicationCommandOptionType.String,
			required: false
		}
	],
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		const itensString = interaction.options.getString("itens", true);
		const quantidade = interaction.options.getInteger("quantidade") || 1;
		const titulo = interaction.options.getString("titulo") || "Sorteio";
		
		// Divide a string em itens individuais e remove espaços em branco
		const itens = itensString.split(",").map(item => item.trim()).filter(item => item.length > 0);
		
		// Verifica se há itens suficientes
		if (itens.length === 0) {
			const embed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("❌ Erro no Sorteio")
				.setDescription("Você precisa fornecer pelo menos um item para o sorteio!")
				.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
				.setTimestamp();

			await interaction.editReply({
				embeds: [embed]
			});
			return;
		}
		
		// Verifica se a quantidade solicitada é maior que o número de itens
		if (quantidade > itens.length) {
			const embed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("❌ Erro no Sorteio")
				.setDescription(`Você solicitou ${quantidade} itens, mas só forneceu ${itens.length} itens para o sorteio!`)
				.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
				.setTimestamp();

			await interaction.editReply({
				embeds: [embed]
			});
			return;
		}
		
		// Função para embaralhar array
		const embaralhar = (array) => {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[array[i], array[j]] = [array[j], array[i]];
			}
			return array;
		};
		
		// Embaralha e seleciona os itens sorteados
		const itensSorteados = embaralhar([...itens]).slice(0, quantidade);
		
		// Cria o embed com o resultado
		const embed = new EmbedBuilder()
			.setColor("Gold")
			.setTitle(`🎲 ${titulo}`)
			.setDescription(`Sorteio realizado por ${user.toString()}`);
		
		// Adiciona os itens sorteados ao embed
		if (quantidade === 1) {
			embed.addFields(
				{ name: "Item Sorteado", value: `**${itensSorteados[0]}**` }
			);
		} else {
			const listaItens = itensSorteados.map((item, index) => `**${index + 1}.** ${item}`).join("\n");
			embed.addFields(
				{ name: `Itens Sorteados (${quantidade})`, value: listaItens }
			);
		}
		
		// Adiciona informações sobre o total de itens
		embed.setFooter({ text: `Total de itens: ${itens.length} • Neko Café Bot` })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});