const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  Partials 
} = require("discord.js");
const express = require("express");

// --- Keep Alive (Render hosting) ---
const app = express();
app.get("/", (req, res) => res.send("Bot is running"));
app.listen(10000, () => console.log("🌍 Web server is running"));

// --- Discord Client ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel]
});

// Cooldown map
const cooldown = new Map();

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const channel = client.channels.cache.find(
    c => c.name === "📋《𝐫𝐞𝐠𝐢𝐬𝐭𝐞𝐫》"
  );
  if (!channel) {
    console.log("⚠️ Register channel not found!");
    return;
  }

  // Embed with button
  const embed = new EmbedBuilder()
    .setColor("Black")
    .setTitle("**Team Create**")
    .setDescription(
      "Click the green button below to register your team into the tournament.\n\n" +
      "➡️ Please use Minecraft nicknames."
    );

  const button = new ButtonBuilder()
    .setCustomId("registerTeam")
    .setLabel("Register")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(button);

  await channel.send({ embeds: [embed], components: [row] });
});

// Button click
client.on("interactionCreate", async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === "registerTeam") {
      const userId = interaction.user.id;
      const now = Date.now();
      const cooldownTime = 24 * 60 * 60 * 1000; // 24h

      if (cooldown.has(userId) && now - cooldown.get(userId) < cooldownTime) {
        const remaining = Math.ceil(
          (cooldownTime - (now - cooldown.get(userId))) / (1000 * 60 * 60)
        );
        return interaction.reply({
          content: `⏳ You can register again in **${remaining}h**.`,
          ephemeral: true
        });
      }

      cooldown.set(userId, now);

      // Modal
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
        .setLabel("Captain (Nick & Discord)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const player2 = new TextInputBuilder()
        .setCustomId("player2")
        .setLabel("Player 2 (Nick & Discord)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const player3 = new TextInputBuilder()
        .setCustomId("player3")
        .setLabel("Player 3 (Nick & Discord)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const player4 = new TextInputBuilder()
        .setCustomId("player4")
        .setLabel("Player 4 (Nick & Discord)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

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
      const player2 = interaction.fields.getTextInputValue("player2");
      const player3 = interaction.fields.getTextInputValue("player3");
      const player4 = interaction.fields.getTextInputValue("player4");

      const embed = new EmbedBuilder()
        .setColor("Black")
        .setTitle("🏆 Team Registered")
        .setDescription(
          `**Team Name:** ${teamName}\n\n` +
          `👑 **Captain:** ${captain}\n` +
          `👤 **Player 2:** ${player2}\n` +
          `👤 **Player 3:** ${player3}\n` +
          `👤 **Player 4:** ${player4}`
        )
        .setFooter({ text: "Tournament Registration System" });

      await interaction.reply({ embeds: [embed] });
    }
  }
});

client.login(process.env.TOKEN);
