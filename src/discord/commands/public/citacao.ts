import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "citacao",
	description: "Receba uma citação motivacional para inspirar seu dia",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		
		// Lista de citações motivacionais
		const citacoes = [
			{
				texto: "A persistência é o caminho do êxito.",
				autor: "Charles Chaplin"
			},
			{
				texto: "No meio da dificuldade encontra-se a oportunidade.",
				autor: "Albert Einstein"
			},
			{
				texto: "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
				autor: "Robert Collier"
			},
			{
				texto: "Não é a força, mas a constância dos bons sentimentos que conduz os homens à felicidade.",
				autor: "Friedrich Nietzsche"
			},
			{
				texto: "A vida é o que acontece enquanto você está ocupado fazendo outros planos.",
				autor: "John Lennon"
			},
			{
				texto: "Cada sonho que você deixa para trás, é um pedaço do seu futuro que deixa de existir.",
				autor: "Steve Jobs"
			},
			{
				texto: "O insucesso é apenas uma oportunidade para recomeçar com mais inteligência.",
				autor: "Henry Ford"
			},
			{
				texto: "Não importa o que você decidiu. O que importa é que isso te faça feliz.",
				autor: "Clarice Lispector"
			},
			{
				texto: "A felicidade não está em viver, mas em saber viver.",
				autor: "Fiódor Dostoiévski"
			},
			{
				texto: "Não espere por uma crise para descobrir o que é importante em sua vida.",
				autor: "Platão"
			},
			{
				texto: "A maior glória em viver não está em nunca cair, mas em nos levantarmos toda vez que caímos.",
				autor: "Nelson Mandela"
			},
			{
				texto: "O que você procura está procurando você.",
				autor: "Rumi"
			},
			{
				texto: "Você nunca sabe que resultados virão da sua ação. Mas se você não fizer nada, não existirão resultados.",
				autor: "Mahatma Gandhi"
			},
			{
				texto: "Não tenha medo da mudança. Coisas boas se vão para que melhores possam vir.",
				autor: "Provérbio Árabe"
			},
			{
				texto: "Acredite em milagres, mas não dependa deles.",
				autor: "Immanuel Kant"
			}
		];
		
		// Seleciona uma citação aleatória
		const citacaoAleatoria = citacoes[Math.floor(Math.random() * citacoes.length)];
		
		const embed = new EmbedBuilder()
			.setColor("#FFD700") // Dourado
			.setTitle("✨ Citação Motivacional")
			.setDescription(`"*${citacaoAleatoria.texto}*"\n\n— **${citacaoAleatoria.autor}**`)
			.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});