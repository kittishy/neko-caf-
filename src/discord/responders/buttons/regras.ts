import { createResponder, ResponderType } from "#base";
import { EmbedBuilder } from "discord.js";
import { z } from "zod";

const schema = z.object({
    date: z.coerce.date(),
});

createResponder({
    customId: "regras/:date", 
    types: [ResponderType.Button], 
    parse: schema.parse, 
    cache: "cached",
    async run(interaction, { date }) {
        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("📜 Regras do Servidor")
            .setDescription("Para garantir uma experiência agradável para todos, por favor siga estas regras:")
            .addFields(
                { name: "1️⃣ Respeito", value: "Trate todos os membros com respeito. Não toleramos discriminação, assédio ou bullying." },
                { name: "2️⃣ Conteúdo Apropriado", value: "Não compartilhe conteúdo NSFW, ilegal ou inadequado." },
                { name: "3️⃣ Spam", value: "Evite spam, flood ou publicidade não autorizada." },
                { name: "4️⃣ Canais", value: "Use os canais para suas finalidades específicas." },
                { name: "5️⃣ Moderação", value: "Siga as orientações dos moderadores e administradores." }
            )
            .setFooter({ text: "Neko Café Bot • Obrigado por seguir nossas regras!" })
            .setTimestamp();

        await interaction.reply({
            ephemeral: true,
            embeds: [embed]
        });
    },
});