import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { loadCommands } from "./commands/index.js";
import { data as embedData } from "./commands/embed.js";

// Carregar configurações do bot
let config = {};
if (fs.existsSync("./config.json")) {
  config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
} else {
  console.error("Arquivo config.json não encontrado. Crie um arquivo com seu token e clientId.");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Carregar comandos
const commandsMap = await loadCommands();
console.log("Comandos carregados:", Array.from(commandsMap.keys()));

const embedCommand = embedData;

const commands = [embedCommand.toJSON()];

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log("Registrando comandos de barra...");
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );
    console.log("Comandos registrados com sucesso!");
  } catch (error) {
    console.error(error);
  }
})();

client.on("ready", () => {
  console.log(`Bot logado como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commandsMap.get(interaction.commandName);
  console.log("Recebido comando:", interaction.commandName, "Encontrado:", !!command);
  if (!command) {
    await interaction.reply({ content: `Comando '${interaction.commandName}' não encontrado.`, ephemeral: true });
    return;
  }
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Erro ao executar o comando /${interaction.commandName}:`, err);
    if (!interaction.replied) {
      await interaction.reply({ content: "Ocorreu um erro ao processar o comando.", ephemeral: true });
    }
  }
});

client.login(config.token);