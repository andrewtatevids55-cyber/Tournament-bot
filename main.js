const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  Events 
} = require("discord.js");
const express = require("express");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel],
});

const app = express();
const PORT = process.env.PORT || 10000;

// --- keep alive ---
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(PORT, () => console.log("🌍 Web server is running"));

// cooldown map
const cooldown = new Map();

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const registerChannel = client.channels.cache.find(c => c.name === "📋《𝐫𝐞𝐠𝐢𝐬𝐭𝐞𝐫》");
  if (!registerChannel) return console.log("❌ Register channel not found.");

  const embed = new EmbedBuilder()
    .setTitle("**Team Create**")
    .setColor("#000000")
    .setDescription("Click the green button to register your team into the tournament.\n- Please use Minecraft nicknames");

  const button = new ButtonBuilder()
    .setCustomId("registerTeam")
    .setLabel("Register")
    .setStyle(ButtonStyle.Success)
    .setEmoji("🏆");

  const row = new ActionRowBuilder().addComponents(button);

  // remove old messages
  const messages = await registerChannel.messages.fetch({ limit: 10 });
  await registerChannel.bulkDelete(messages);

  await registerChannel.send({ embeds: [embed], components: [row] });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === "registerTeam") {
      const lastUsed = cooldown.get(interaction.user.id);
      if (lastUsed && Date.now() - lastUsed < 24 * 60 * 60 * 1000) {
        return interaction.reply({ content: "⏳ You can only register once every 24 hours!", ephemeral: true });
      }

      cooldown.set(interaction.user.id, Date.now());

      const modal = new ModalBuilder()
        .setCustomId("teamForm")
        .setTitle("Team Registration");

      const teamName = new TextInputBuilder()
        .setCustomId("teamName")
        .setLabel("Team Name")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const captain = new TextInputBuilder()
        .setCustomId("captain")
        .setLabel("Captain")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const player2 = new TextInputBuilder()
        .setCustomId("player2")
        .setLabel("Player 2")
        .setStyle(TextInputStyle.Short);

      const player3 = new TextInputBuilder()
        .setCustomId("player3")
        .setLabel("Player 3")
        .setStyle(TextInputStyle.Short);

      const player4 = new TextInputBuilder()
        .setCustomId("player4")
        .setLabel("Player 4")
        .setStyle(TextInputStyle.Short);

      modal.addComponents(
        new ActionRowBuilder().addComponents(teamName),
        new ActionRowBuilder().addComponents(captain),
        new ActionRowBuilder().addComponents(player2),
        new ActionRowBuilder().addComponents(player3),
        new ActionRowBuilder().addComponents(player4)
      );

      await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === "teamForm") {
      const teamName = interaction.fields.getTextInputValue("teamName");
      const captain = interaction.fields.getTextInputValue("captain");
      const player2 = interaction.fields.getTextInputValue("player2") || "—";
      const player3 = interaction.fields.getTextInputValue("player3") || "—";
      const player4 = interaction.fields.getTextInputValue("player4") || "—";

      const teamsChannel = interaction.guild.channels.cache.find(c => c.name === "⚔️《𝐭𝐞𝐚𝐦𝐬》");
      if (teamsChannel) {
        const embed = new EmbedBuilder()
          .setTitle("Team Registered 🏆")
          .setColor("#000000")
          .addFields(
            { name: "Team Name", value: teamName, inline: false },
            { name: "🥷 Captain", value: captain, inline: true },
            { name: "🥷 Player 2", value: player2, inline: true },
            { name: "🥷 Player 3", value: player3, inline: true },
            { name: "🥷 Player 4", value: player4, inline: true }
          )
          .setFooter({ text: "Tournament Registration" })
          .setTimestamp();

        await teamsChannel.send({ embeds: [embed] });
      }

      await interaction.reply({ content: `Your team **${teamName}** has been successfully registered! 🏆`, ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
