const { Client, GatewayIntentBits, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SlashCommandBuilder, Events, InteractionType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log(`✅ Přihlášen jako ${client.user.tag}`);
});

// Registrace slash příkazu
client.on('ready', async () => {
    const data = new SlashCommandBuilder()
        .setName('team')
        .setDescription('Zaregistruj tým do turnaje');
    await client.application.commands.create(data);
});

// Otevření formuláře
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'team') {
        const modal = new ModalBuilder()
            .setCustomId('teamForm')
            .setTitle('Registrace týmu');

        const inputs = [
            { id: 'teamName', label: 'Název týmu', placeholder: 'Team Tygrů' },
            { id: 'captainName', label: 'Kapitán (nick)', placeholder: 'Pepa' },
            { id: 'captainDc', label: 'Kapitán (Discord tag)', placeholder: 'Pepa#1234' },
            { id: 'player2', label: 'Hráč 2', placeholder: 'Karel#1111' },
            { id: 'player3', label: 'Hráč 3', placeholder: 'Marek#2222' },
            { id: 'player4', label: 'Hráč 4', placeholder: 'Jirka#3333' },
            { id: 'player5', label: 'Hráč 5', placeholder: 'Lukas#4444' }
        ];

        modal.addComponents(inputs.map(inp =>
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId(inp.id)
                    .setLabel(inp.label)
                    .setPlaceholder(inp.placeholder)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            )
        ));

        await interaction.showModal(modal);
    }
});

// Zpracování formuláře
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId === 'teamForm') {
        const values = {};
        ['teamName','captainName','captainDc','player2','player3','player4','player5']
            .forEach(id => values[id] = interaction.fields.getTextInputValue(id));

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
    }
});

client.login(process.env.TOKEN);
