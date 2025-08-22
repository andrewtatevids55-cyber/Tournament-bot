const { Client, GatewayIntentBits, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SlashCommandBuilder, Events, InteractionType } = require('discord.js');
const express = require('express');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Bot login
client.once('ready', () => console.log(`✅ Logged in as ${client.user.tag}`));

// Register slash command
client.on('ready', async () => {
    const data = new SlashCommandBuilder()
        .setName('team')
        .setDescription('Register your team for the tournament');
    await client.application.commands.create(data);
});

// Show modal
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'team') {
        const modal = new ModalBuilder()
            .setCustomId('teamForm')
            .setTitle('Team Registration');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('teamName').setLabel('Team Name 🏆').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('captainName').setLabel('Captain 👑').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('player2').setLabel('Player 2 🎯').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('player3').setLabel('Player 3 🎯').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('player4').setLabel('Player 4 🎯').setStyle(TextInputStyle.Short).setRequired(true)
            )
        );

        await interaction.showModal(modal);
    }
});

// Handle modal submission
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId !== 'teamForm') return;

    const values = {};
    ['teamName','captainName','player2','player3','player4']
        .forEach(id => values[id] = interaction.fields.getTextInputValue(id));

    const embed = new EmbedBuilder()
        .setTitle(`📢 New Team Registered!`)
        .setColor(0x1abc9c) // Fancy turquoise color
        .setDescription(`Team **${values.teamName}** has been successfully registered!`)
        .addFields(
            { name: '👑 Captain', value: values.captainName, inline: false },
            { name: '🎯 Players', value: `• ${values.player2}\n• ${values.player3}\n• ${values.player4}`, inline: false }
        )
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/616/616408.png') // Example trophy icon
        .setTimestamp()
        .setFooter({ text: 'Tournament Registration', iconURL: 'https://cdn-icons-png.flaticon.com/512/190/190411.png' });

    await interaction.reply({ content: `✅ Team **${values.teamName}** has been successfully registered!`, ephemeral: true });

    const logChannel = interaction.guild.channels.cache.find(c => c.name === 'turnaj-teams');
    if (logChannel) await logChannel.send({ embeds: [embed] });
});

// Bot login
client.login(process.env.TOKEN);

// Express server for Render port
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is online ✅'));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));
