const { Client, GatewayIntentBits, Events } = require("discord.js");
require("dotenv").config();
const fs = require("fs");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.commands = new Map();

// načtení všech commandů z /commands složky
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// event pro příkazy
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isModalSubmit()) return;

  // pokud je command, spustíme jeho execute
  const command = client.commands.get(interaction.commandName) || Array.from(client.commands.values())[0];
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
  }
});

client.login(process.env.TOKEN);
