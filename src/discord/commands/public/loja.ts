import { db } from "#database";
import { createCommand } from "#base";
import { createRow } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

// Lista de itens disponíveis na loja
const itensLoja = [
	{ id: "vip", nome: "VIP por 7 dias", descricao: "Status VIP no servidor por uma semana", preco: 1000 },
	{ id: "cor", nome: "Cor Personalizada", descricao: "Mude a cor do seu nome no servidor", preco: 500 },
	{ id: "titulo", nome: "Título Personalizado", descricao: "Adicione um título personalizado ao seu perfil", preco: 750 },
	{ id: "emoji", nome: "Emoji Exclusivo", descricao: "Desbloqueie um emoji exclusivo para usar", preco: 300 },
	{ id: "fundo", nome: "Fundo de Perfil", descricao: "Desbloqueie um fundo personalizado para seu perfil", preco: 1200 }
];

createCommand({
	name: "loja",
	description: "Acesse a loja para comprar itens com suas moedas",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "comprar",
			description: "Compre um item da loja",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "item",
					description: "O item que você deseja comprar",
					type: ApplicationCommandOptionType.String,
					required: true,
					choices: itensLoja.map(item => ({
						name: `${item.nome} (${item.preco} moedas)`,
						value: item.id
					}))
				}
			]
		},
		{
			name: "listar",
			description: "Veja todos os itens disponíveis na loja",
			type: ApplicationCommandOptionType.Subcommand
		}
	],
	async run(interaction) {
		await interaction.deferReply();

		const { user, member } = interaction;
		const subcommand = interaction.options.getSubcommand();
		
		// Busca ou cria o documento do membro no banco de dados
		const memberData = await db.members.get(member);
		const saldoAtual = memberData.wallet.coins;
		
		if (subcommand === "listar") {
			// Cria campos para cada item da loja
			const camposItens = itensLoja.map(item => ({
				name: `${item.nome} - ${item.preco} moedas`,
				value: item.descricao
			}));
			
			const embed = new EmbedBuilder()
				.setColor("Gold")
				.setTitle("🛒 Loja do Neko Café")
				.setDescription(`Bem-vindo à loja, ${user.toString()}! Você tem **${saldoAtual} moedas**.`)
				.addFields(camposItens)
				.setFooter({ text: "Neko Café Bot • Use /loja comprar para adquirir um item" })
				.setTimestamp();

			const row = createRow(
				new ButtonBuilder({ 
					customId: `loja_ajuda/${new Date().toISOString()}`,
					label: "Como ganhar moedas?",
					style: ButtonStyle.Secondary,
				})
			);

			await interaction.editReply({
				embeds: [embed],
				components: [row]
			});
			return;
		}
		
		if (subcommand === "comprar") {
			const itemId = interaction.options.getString("item", true);
			const itemSelecionado = itensLoja.find(item => item.id === itemId);
			
			if (!itemSelecionado) {
				await interaction.editReply({
					content: "Item não encontrado na loja. Use `/loja listar` para ver os itens disponíveis."
				});
				return;
			}
			
			// Verifica se o usuário tem moedas suficientes
			if (saldoAtual < itemSelecionado.preco) {
				const embed = new EmbedBuilder()
					.setColor("Red")
					.setTitle("❌ Saldo Insuficiente")
					.setDescription(`Você não tem moedas suficientes para comprar **${itemSelecionado.nome}**.`)
					.addFields(
						{ name: "Seu saldo", value: `${saldoAtual} moedas` },
						{ name: "Preço do item", value: `${itemSelecionado.preco} moedas` },
						{ name: "Faltam", value: `${itemSelecionado.preco - saldoAtual} moedas` }
					)
					.setFooter({ text: "Neko Café Bot • Use /trabalhar para ganhar mais moedas" })
					.setTimestamp();

				await interaction.editReply({
					embeds: [embed]
				});
				return;
			}
			
			// Processa a compra
			memberData.wallet.coins -= itemSelecionado.preco;
			
			// Adiciona o item ao inventário do usuário (simulado - em uma implementação real, você adicionaria isso ao schema)
			if (!memberData.inventory) memberData.inventory = [];
			memberData.inventory.push({
				id: itemSelecionado.id,
				nome: itemSelecionado.nome,
				dataCompra: new Date()
			});
			
			await memberData.save();
			
			const embed = new EmbedBuilder()
				.setColor("Green")
				.setTitle("✅ Compra Realizada!")
				.setDescription(`Você comprou **${itemSelecionado.nome}** por **${itemSelecionado.preco} moedas**!`)
				.addFields(
					{ name: "Saldo Anterior", value: `${saldoAtual} moedas` },
					{ name: "Saldo Atual", value: `${memberData.wallet.coins} moedas` }
				)
				.setFooter({ text: "Neko Café Bot • Obrigado pela compra!" })
				.setTimestamp();

			await interaction.editReply({
				embeds: [embed]
			});
		}
	}
});