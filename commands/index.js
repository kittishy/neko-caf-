import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
const __dirname = path.resolve();

export async function loadCommands() {
  const commands = new Map();
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js") && file !== "index.js");
  for (const file of commandFiles) {
    const fileUrl = pathToFileURL(path.join(commandsPath, file)).href;
    const command = await import(fileUrl);
    if (command.data && command.execute) {
      commands.set(command.data.name, command);
    }
  }
  return commands;
}