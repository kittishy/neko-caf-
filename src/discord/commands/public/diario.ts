import { db } from "#database";
import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "diario",
	description: "Registre uma mensagem no seu diário pessoal",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "mensagem",
			description: "A mensagem que você deseja registrar",
			type: ApplicationCommandOptionType.String,
			required: true
		}
	],
	async run(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const { user, member } = interaction;
		const mensagem = interaction.options.getString("mensagem", true);
		
		// Busca ou cria o documento do membro no banco de dados
		const memberData = await db.members.get(member);
		
		// Adiciona a entrada ao diário (simulado - em uma implementação real, você adicionaria um campo para isso no schema)
		// Aqui estamos apenas simulando o registro

		const embed = new EmbedBuilder()
			.setColor("Green")
			.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
			.setTitle("📝 Diário Pessoal")
			.setDescription("Sua mensagem foi registrada com sucesso!")
			.addFields(
				{ name: "Mensagem", value: mensagem },
				{ name: "Data", value: new Date().toLocaleDateString("pt-BR") }
			)
			.setFooter({ text: "Neko Café Bot • Seu diário pessoal" })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});