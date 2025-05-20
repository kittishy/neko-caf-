import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
	name: "curiosidade",
	description: "Receba uma curiosidade aleatória e interessante",
	type: ApplicationCommandType.ChatInput,
	async run(interaction) {
		await interaction.deferReply();

		const { user } = interaction;
		
		// Lista de curiosidades
		const curiosidades = [
			"O mel é o único alimento que não estraga. Arqueólogos encontraram potes de mel em tumbas egípcias com mais de 3.000 anos e ainda estava bom para consumo!",
			"Gatos não conseguem sentir o gosto doce porque não têm receptores para isso em suas línguas.",
			"O coração de um camarão está localizado em sua cabeça.",
			"A Lua se afasta da Terra a uma taxa de aproximadamente 3,8 centímetros por ano.",
			"Os golfinhos dormem com metade do cérebro de cada vez, mantendo um olho aberto para monitorar predadores e subirem à superfície para respirar.",
			"O recorde mundial de maior tempo sem dormir é de 11 dias e 25 minutos, estabelecido por Randy Gardner em 1964.",
			"As impressões digitais das koalas são tão semelhantes às humanas que já foram confundidas em cenas de crime.",
			"A língua de uma baleia-azul pode pesar tanto quanto um elefante adulto.",
			"Os flamingos são naturalmente brancos - sua cor rosa vem dos carotenoides em sua dieta de camarões e algas.",
			"O Oceano Pacífico encolhe aproximadamente 2,5 centímetros por ano devido à subducção das placas tectônicas.",
			"Uma nuvem média pesa em torno de 500 toneladas, o equivalente a 100 elefantes.",
			"O veneno do escorpião mais mortal do mundo, o escorpião-de-rabo-amarelo, é usado para criar medicamentos para tratar doenças como artrite e esclerose múltipla.",
			"Os astronautas crescem cerca de 5 centímetros enquanto estão no espaço devido à ausência de gravidade.",
			"As formigas não dormem. Em vez disso, elas têm períodos de descanso onde suas antenas ficam relaxadas.",
			"O coração de uma baleia-azul é tão grande que um ser humano poderia nadar através de suas artérias."
		];
		
		// Seleciona uma curiosidade aleatória
		const curiosidadeAleatoria = curiosidades[Math.floor(Math.random() * curiosidades.length)];
		
		const embed = new EmbedBuilder()
			.setColor("Aqua")
			.setTitle("🧠 Você Sabia?")
			.setDescription(curiosidadeAleatoria)
			.setFooter({ text: `Neko Café Bot • Solicitado por ${user.username}` })
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed]
		});
	}
});