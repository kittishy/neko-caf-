import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "fato",
	description: "Receba um fato aleatório e interessante sobre diversos temas",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		
		// Lista de fatos aleatórios
		const fatos = [
			{
				fato: "Um raio contém energia suficiente para torrar 160.000 fatias de pão.",
				categoria: "Ciência"
			},
			{
				fato: "O coração de uma baleia azul é tão grande que um ser humano poderia nadar através de suas artérias.",
				categoria: "Biologia"
			},
			{
				fato: "Os golfinhos dão nomes uns aos outros e respondem quando são chamados.",
				categoria: "Animais"
			},
			{
				fato: "A Grande Muralha da China não é visível do espaço a olho nu, ao contrário da crença popular.",
				categoria: "História"
			},
			{
				fato: "O mel é o único alimento que não estraga. Arqueólogos encontraram potes de mel em tumbas egípcias com mais de 3.000 anos ainda comestíveis.",
				categoria: "Alimentação"
			},
			{
				fato: "Existem mais combinações possíveis em um baralho de 52 cartas do que átomos na Terra.",
				categoria: "Matemática"
			},
			{
				fato: "Os octópodes têm três corações: dois bombeiam sangue através das guelras e um bombeia através do corpo.",
				categoria: "Biologia Marinha"
			},
			{
				fato: "A língua de uma baleia-azul pode pesar tanto quanto um elefante adulto.",
				categoria: "Animais"
			},
			{
				fato: "O primeiro tweet do espaço foi enviado pelo astronauta T.J. Creamer em 22 de janeiro de 2010.",
				categoria: "Tecnologia"
			},
			{
				fato: "A Lua se afasta da Terra a uma taxa de 3,8 centímetros por ano.",
				categoria: "Astronomia"
			},
			{
				fato: "Os Vikings usavam ossos de animais mortos como patins para deslizar sobre o gelo.",
				categoria: "História"
			},
			{
				fato: "O recorde mundial de maior tempo sem dormir é de 11 dias e 25 minutos, estabelecido por Randy Gardner em 1964.",
				categoria: "Recordes"
			},
			{
				fato: "As impressões digitais das koalas são tão semelhantes às humanas que já foram confundidas em cenas de crime.",
				categoria: "Animais"
			},
			{
				fato: "O Vaticano é o país com a maior taxa de criminalidade do mundo per capita, principalmente devido à sua pequena população e ao grande número de turistas.",
				categoria: "Geografia"
			},
			{
				fato: "Um cubo de ouro puro com 20 cm de lado valeria mais de 8 milhões de dólares.",
				categoria: "Economia"
			},
			{
				fato: "O primeiro videogame comercial foi o 'Pong', lançado em 1972 pela Atari.",
				categoria: "Jogos"
			},
			{
				fato: "A água quente congela mais rápido que a água fria em certas circunstâncias, um fenômeno conhecido como Efeito Mpemba.",
				categoria: "Física"
			},
			{
				fato: "O Brasil é o único país que participou de todas as Copas do Mundo de futebol.",
				categoria: "Esportes"
			},
			{
				fato: "A Biblioteca do Congresso dos EUA armazena mais de 167 milhões de itens em aproximadamente 1.350 km de prateleiras.",
				categoria: "Literatura"
			},
			{
				fato: "Os gatos não conseguem sentir o sabor doce devido à falta de receptores específicos em suas papilas gustativas.",
				categoria: "Animais"
			}
		];
		
		// Seleciona um fato aleatório
		const fatoAleatorio = fatos[Math.floor(Math.random() * fatos.length)];
		
		// Define cores para diferentes categorias
		const cores = {
			Ciência: "#3498DB", // Azul
			Biologia: "#2ECC71", // Verde
			Animais: "#F1C40F", // Amarelo
			História: "#E67E22", // Laranja
			Alimentação: "#E74C3C", // Vermelho
			Matemática: "#9B59B6", // Roxo
			"Biologia Marinha": "#1ABC9C", // Verde-água
			Tecnologia: "#34495E", // Azul escuro
			Astronomia: "#8E44AD", // Roxo escuro
			Recordes: "#D35400", // Laranja escuro
			Geografia: "#16A085", // Verde escuro
			Economia: "#F39C12", // Amarelo escuro
			Jogos: "#2980B9", // Azul médio
			Física: "#27AE60", // Verde médio
			Esportes: "#C0392B", // Vermelho escuro
			Literatura: "#7F8C8D" // Cinza
		};
		
		// Obtém a cor para a categoria ou usa roxo como padrão
		const cor = cores[fatoAleatorio.categoria] || "#9B59B6";
		
		const embed = new EmbedBuilder()
			.setColor(cor)
			.setTitle(`📚 Fato Aleatório: ${fatoAleatorio.categoria}`)
			.setDescription(`**Você sabia?**\n\n${fatoAleatorio.fato}`)
			.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});