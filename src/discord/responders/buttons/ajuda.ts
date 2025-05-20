import { createResponder, ResponderType } from "#base";
import { EmbedBuilder } from "discord.js";
import { z } from "zod";

const schema = z.object({
    date: z.coerce.date(),
});

createResponder({
    customId: "ajuda/:date", 
    types: [ResponderType.Button], 
    parse: schema.parse, 
    cache: "cached",
    async run(interaction, { date }) {
        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("📚 Central de Ajuda")
            .setDescription("Aqui estão algumas informações úteis para te ajudar a navegar pelo servidor:")
            .addFields(
                { name: "🤖 Comandos do Bot", value: "Use `/` para ver a lista de comandos disponíveis." },
                { name: "🔍 Suporte", value: "Se precisar de ajuda adicional, mencione um moderador ou administrador." },
                { name: "🎮 Diversão", value: "Experimente o comando `/bemvindo` para ver a mensagem de boas-vindas novamente." },
                { name: "💰 Economia", value: "Ganhe moedas interagindo no servidor e use-as para comprar itens especiais!" }
            )
            .setFooter({ text: "Neko Café Bot • Sempre aqui para ajudar!" })
            .setTimestamp();

        await interaction.reply({
            ephemeral: true,
            embeds: [embed]
        });
    },
});