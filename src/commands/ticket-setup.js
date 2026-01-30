const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType } = require('discord.js');

const ALLOWED_ROLES = [
    '1464461234119376960', // DiamondLife RP
    '825864546899198022',  // Medical Discord RP
    '1465303406360006759'  // Police Discord RP
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Erstellt ein Ticket-System Panel.')
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('Die Kategorie, in der Tickets erstellt werden sollen.')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Die Rolle, die Zugriff auf die Tickets haben soll (Team/Support).')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Der Kanal, in den das Ticket-Panel gesendet werden soll (Standard: aktueller Kanal).')
                .addChannelTypes(ChannelType.GuildText)),
    async execute(interaction) {
        // Role Permission Check
        const hasRole = interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id));

        // Also allow generic administrators
        const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!hasRole && !isAdmin) {
            return interaction.reply({
                content: '❌ Du hast keine Berechtigung, diesen Befehl zu verwenden.',
                ephemeral: true
            });
        }

        const category = interaction.options.getChannel('category');
        const role = interaction.options.getRole('role');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        // Create the Modal
        // We encode the config in the customId: setup_modal:<categoryId>:<roleId>:<targetChannelId>
        const modalId = `setup_modal:${category.id}:${role.id}:${channel.id}`;

        const modal = new ModalBuilder()
            .setCustomId(modalId)
            .setTitle('Ticket System Konfiguration');

        const titleInput = new TextInputBuilder()
            .setCustomId('ticketTitle')
            .setLabel("Panel Titel")
            .setValue("Support Tickets")
            .setStyle(TextInputStyle.Short);

        const descInput = new TextInputBuilder()
            .setCustomId('ticketDesc')
            .setLabel("Panel Beschreibung")
            .setValue("Klicke auf den Button, um ein Ticket zu öffnen.")
            .setStyle(TextInputStyle.Paragraph);

        const btnLabelInput = new TextInputBuilder()
            .setCustomId('btnLabel')
            .setLabel("Button Beschriftung")
            .setValue("Ticket öffnen")
            .setStyle(TextInputStyle.Short);

        const welcomeInput = new TextInputBuilder()
            .setCustomId('welcomeMsg')
            .setLabel("Willkommensnachricht im Ticket")
            .setValue("Hallo! Ein Teammitglied wird sich bald um dich kümmern. Bitte beschreibe dein Anliegen.")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        const ticketNameInput = new TextInputBuilder()
            .setCustomId('ticketName')
            .setLabel("Ticket Name Format (z.B. ticket-{user})")
            .setValue("ticket-{user}")
            .setStyle(TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
        const secondActionRow = new ActionRowBuilder().addComponents(descInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(btnLabelInput);
        const fourthActionRow = new ActionRowBuilder().addComponents(ticketNameInput);
        const fifthActionRow = new ActionRowBuilder().addComponents(welcomeInput);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

        await interaction.showModal(modal);
    },
};
