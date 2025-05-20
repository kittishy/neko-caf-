import { createCommand } from "#base";
import { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "lembrete",
	description: "Defina um lembrete para ser avisado após um tempo especificado.",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: "mensagem",
			description: "Mensagem do lembrete",
			type: ApplicationCommandOptionType.String,
			required: true
		},
		{
			name: "tempo",
			description: "Tempo em minutos para o lembrete",
			type: ApplicationCommandOptionType.Integer,
			minValue: 1,
			required: true
		}
	],
	async run(interaction) {
		await interaction.deferReply({ ephemeral: true });
		const { user } = interaction;
		const mensagem = interaction.options.getString("mensagem", true);
		const tempo = interaction.options.getInteger("tempo", true);
		const embed = new EmbedBuilder()
			.setColor("Yellow")
			.setTitle("⏰ Lembrete Definido!")
			.setDescription(`Você será lembrado em **${tempo}** minuto(s):\n> ${mensagem}`)
			.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
			.setTimestamp();
		await interaction.editReply({ embeds: [embed] });
		setTimeout(async () => {
			try {
				await interaction.followUp({
					content: `${user.toString()} ⏰ Seu lembrete: ${mensagem}`,
					ephemeral: false
				});
			} catch (e) {}
		}, tempo * 60 * 1000);
	}
});