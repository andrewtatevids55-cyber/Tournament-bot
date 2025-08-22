const { Client, GatewayIntentBits, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SlashCommandBuilder, Events, InteractionType } = require('discord.js');
const express = require('express');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Přihlášení bota
client.once('ready', () => console.log(`✅ Přihlášen jako ${client.user.tag}`));

// Registrace slash příkazu
client.on('ready', async () => {
    const data = new SlashCommandBuilder()
        .setName('team')
        .setDescription('Zaregistruj svůj tým do turnaje');
    await client.application.commands.create(data);
});

// Otevření modalu (formuláře)
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'team') {
        const modal = new ModalBuilder()
            .setCustomId('teamForm')
            .setTitle('Registrace týmu');

        // 5 ActionRow - každý jen jeden TextInput
        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('teamName').setLabel('Název týmu').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('captainName').setLabel('Kapitán').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('player2').setLabel('Hráč 2').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('player3').setLabel('Hráč 3').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('player4').setLabel('Hráč 4').setStyle(TextInputStyle.Short).setRequired(true)
            )
        );

        await interaction.showModal(modal);
    }
});

// Zpracování formuláře
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId !== 'teamForm') return;

    const values = {};
    ['teamName','captainName','player2','player3','player4']
        .forEach(id => values[id] = interaction.fields.getTextInputValue(id));

    // Fancy embed
    const embed = new EmbedBuilder()
        .setTitle('📢 Nový tým registrován!')
        .setColor(0x00ff00)
        .setDescription(`Tým **${values.teamName}** byl úspěšně zaregistrován!`)
        .addFields(
            { name: 'Kapitán', value: values.captainName, inline: false },
            { name: 'Ostatní hráči', value: `${values.player2}\n${values.player3}\n${values.player4}`, inline: false }
        )
        .setTimestamp();

    await interaction.reply({ content: `✅ Tým **${values.teamName}** byl úspěšně registrován!`, ephemeral: true });

    const logChannel = interaction.guild.channels.cache.find(c => c.name === 'turnaj-teams');
    if (logChannel) await logChannel.send({ embeds: [embed] });
});

// Přihlášení bota
client.login(process.env.TOKEN);

// Express server pro Render port
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot je online ✅'));
app.listen(PORT, () => console.log(`Web server běží na portu ${PORT}`));

