import { 
  Client, 
  ClientEvents, 
  CommandInteraction, 
  Message, 
  ApplicationCommandData 
} from 'discord.js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Tipos para os criadores
type EventCallback<K extends keyof ClientEvents> = (
  client: Client,
  ...args: ClientEvents[K]
) => Promise<void> | void;

type ResponderCallback = (
  client: Client,
  message: Message
) => Promise<void> | void;

type CommandCallback = (
  client: Client,
  interaction: CommandInteraction
) => Promise<void> | void;

// Funções de criação personalizadas
export function createEvent<K extends keyof ClientEvents>(
  name: K,
  run: EventCallback<K>,
  once?: boolean
) {
  return { name, run, once: once ?? false };
}

export function createResponder(
  name: string,
  run: ResponderCallback,
  options?: { pattern?: RegExp }
) {
  return { name, run, options };
}

export function createCommand(
  data: ApplicationCommandData,
  run: CommandCallback
) {
  return { data, run };
}

let config = {};

if (fs.existsSync("./config.json")) {
  config = dotenv.parse(fs.readFileSync("./.env", "utf8"));
}