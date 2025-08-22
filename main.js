const { Client, GatewayIntentBits, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SlashCommandBuilder, Events, InteractionType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Přihlášení bota
client.once('ready', () => console.log(`✅ Přihlášen jako ${client.user.tag}`));

// Registrace slash příkazu
client.on('ready', async () => {
    const data = new SlashCommandBuilder().setName('team').setDescription('Zaregistruj tým do turnaje');
    await client.application.commands.create(data);
});

// Otevření modalu (formuláře)
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'team') {
        const modal = new ModalBuilder().setCustomId('teamForm').setTitle('Registrace týmu');

        // 5 ActionRow, každý max 2 inputy
        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('teamName').setLabel('Název týmu').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('captainName').setLabel('Kapitán (nick)').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('captainDc').setLabel('Kapitán (Discord tag)').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('player2').setLabel('Hráč 2').setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('player3').setLabel('Hráč 3').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('player4').setLabel('Hráč 4').setStyle(TextInputStyle.Short).setRequired(true),
                new TextInputBuilder().setCustomId('player5').setLabel('Hráč 5').setStyle(TextInputStyle.Short).setRequired(true)
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
    ['teamName','captainName','captainDc','player2','player3','player4','player5'].forEach(id => values[id] = interaction.fields.getTextInputValue(id));

    const embed = new EmbedBuilder()
        .setTitle('📢 Nový tým registrován!')
        .setColor(0x00ff00)
        .addFields(
            { name: 'Název týmu', value: values.teamName },
            { name: 'Kapitán', value: `${values.captainName} (${values.captainDc})` },
            { name: 'Hráči', value: `${values.player2}\n${values.player3}\n${values.player4}\n${values.player5}` }
        )
        .setTimestamp();

    await interaction.reply({ content: `✅ Tým **${values.teamName}** byl úspěšně registrován!`, ephemeral: true });

    const logChannel = interaction.guild.channels.cache.find(c => c.name === 'turnaj-teams');
    if (logChannel) await logChannel.send({ embeds: [embed] });
});

client.login(process.env.TOKEN);
