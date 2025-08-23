// main.js
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Events } = require('discord.js');
const express = require('express');
const app = express();

// jednoduchý web server pro Render
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(process.env.PORT || 10000, () => console.log('🌍 Web server is running'));

// Bot client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel],
});

// Cooldown mapa
const cooldown = new Map();

client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // najde kanál podle názvu
  const registerChannel = client.channels.cache.find(c => c.name === "📋《𝐫𝐞𝐠𝐢𝐬𝐭𝐞𝐫》");
  if (!registerChannel) return console.log("❌ Channel not found!");

  // embed s tlačítkem
  const embed = new EmbedBuilder()
    .setTitle("Team Create")
    .setDescription("Click on the green button to register your team into the tournament\n- please use minecraft nicks")
    .setColor(0x000000);

  const button = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("registerTeam")
      .setLabel("Register")
      .setStyle(ButtonStyle.Success)
  );

  await registerChannel.send({ embeds: [embed], components: [button] });
});

// Kliknutí na tlačítko
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "registerTeam") {
    const userId = interaction.user.id;
    const now = Date.now();

    // cooldown check
    if (cooldown.has(userId) && now - cooldown.get(userId) < 24 * 60 * 60 * 1000) {
      return interaction.reply({ content: "⏳ You can only register once every 24 hours.", ephemeral: true });
    }

    cooldown.set(userId, now);

    // Modal pro registraci
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
      .setLabel("Captain (Minecraft Nick & Discord Tag)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const player1 = new TextInputBuilder()
      .setCustomId("player1")
      .setLabel("Player 1 (Nick & Discord Tag)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const player2 = new TextInputBuilder()
      .setCustomId("player2")
      .setLabel("Player 2 (Nick & Discord Tag)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const player3 = new TextInputBuilder()
      .setCustomId("player3")
      .setLabel("Player 3 (Nick & Discord Tag)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const player4 = new TextInputBuilder()
      .setCustomId("player4")
      .setLabel("Player 4 (Nick & Discord Tag)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(teamName),
      new ActionRowBuilder().addComponents(captain),
      new ActionRowBuilder().addComponents(player1),
      new ActionRowBuilder().addComponents(player2),
      new ActionRowBuilder().addComponents(player3),
      new ActionRowBuilder().addComponents(player4)
    );

    await interaction.showModal(modal);
  }
});

// Odeslání formuláře
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "teamForm") {
    const teamName = interaction.fields.getTextInputValue("teamName");
    const captain = interaction.fields.getTextInputValue("captain");
    const player1 = interaction.fields.getTextInputValue("player1");
    const player2 = interaction.fields.getTextInputValue("player2");
    const player3 = interaction.fields.getTextInputValue("player3");
    const player4 = interaction.fields.getTextInputValue("player4");

    const embed = new EmbedBuilder()
      .setTitle("🏆 New Team Registered")
      .setColor(0x000000)
      .addFields(
        { name: "Team Name", value: teamName, inline: false },
        { name: "Captain", value: captain, inline: false },
        { name: "Player 1", value: player1, inline: false },
        { name: "Player 2", value: player2, inline: false },
        { name: "Player 3", value: player3, inline: false },
        { name: "Player 4", value: player4, inline: false },
      )
      .setFooter({ text: "Tournament Registration" });

    const logChannel = client.channels.cache.find(c => c.name === "📋《𝐫𝐞𝐠𝐢𝐬𝐭𝐞𝐫》");
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }

    await interaction.reply({ content: "✅ Your team has been registered successfully!", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
