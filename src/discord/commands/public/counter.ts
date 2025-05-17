import { createCommand, createResponder, ResponderType } from "#base";
import { createContainer, createSection, createSeparator } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, InteractionReplyOptions } from "discord.js";

// Função de tradução simples (mock), substitua por integração real se necessário
function t(key: string, vars?: Record<string, any>) {
    const dict: Record<string, string> = {
        "counter.description": "Comando de contador 🔢",
        "counter.current": "Valor atual: `{{value}}`",
        "counter.reset": "Resetar",
        "counter.increment": "Incrementar valor",
        "counter.decrement": "Decrementar valor"
    };
    let str = dict[key] || key;
    if (vars) {
        for (const k in vars) {
            str = str.replace(`{{${k}}}`, String(vars[k]));
        }
    }
    return str;
}

createCommand({
    name: "counter",
    description: t("counter.description"),
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        await interaction.reply(counterMenu(0));
    }
});

createResponder({
    customId: "counter/:current",
    types: [ResponderType.Button], cache: "cached",
    parse: params => ({ 
        current: Number.parseInt(params.current) 
    }),
    async run(interaction, { current }) {
        await interaction.update(
            counterMenu(current)
        );
    },
});

function counterMenu<R>(current: number): R {
    const container = createContainer({
        accentColor: "Random",
        components: [
            createSection(
                `## ${t("counter.current", { value: current })}`,
                new ButtonBuilder({
                    customId: `counter/reset/${current}`,
                    label: t("counter.reset"),
                    disabled: current === 0,
                    style:
                        current > 0 ? ButtonStyle.Primary :
                        current < 0 ? ButtonStyle.Danger :
                        ButtonStyle.Secondary
                }),
            ),
            createSeparator(),
            createSection(
                t("counter.increment"),
                new ButtonBuilder({
                    customId: `counter/${current+1}`,
                    label: "+", style: ButtonStyle.Success
                }),
            ),
            createSection(
                t("counter.decrement"),
                new ButtonBuilder({
                    customId: `counter/${current-1}`,
                    label: "-", style: ButtonStyle.Danger
                }),
            ),
        ]
    });

    return ({
        flags: ["Ephemeral", "IsComponentsV2"],
        components: [container]
    } satisfies InteractionReplyOptions) as R;
}