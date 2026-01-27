const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const ALLOWED_ROLES = [
    '1464461234119376960', // DiamondLife RP
    '825864546899198022',  // Medical Discord RP
    '1465303406360006759'  // Police Discord RP
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Sendet eine anpassbare Embed-Nachricht in einen bestimmten Kanal.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Der Kanal, in den die Nachricht gesendet werden soll.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Der Titel des Embeds.'))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Die Beschreibung/Inhalt des Embeds.'))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Die Farbe des Embeds (Hex-Code, z.B. #FF0000).'))
        .addStringOption(option =>
            option.setName('footer')
                .setDescription('Der Text für die Fußzeile.'))
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Ein großes Bild unten im Embed.'))
        .addAttachmentOption(option =>
            option.setName('thumbnail')
                .setDescription('Ein kleines Bild oben rechts im Embed.')),
    async execute(interaction) {
        // Role Permission Check
        const hasRole = interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id));

        if (!hasRole) {
            return interaction.reply({
                content: '❌ Du hast keine Berechtigung, diesen Befehl zu verwenden.',
                ephemeral: true
            });
        }

        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color');
        const footer = interaction.options.getString('footer');
        const image = interaction.options.getAttachment('image');
        const thumbnail = interaction.options.getAttachment('thumbnail');

        // Check if the bot can send messages in the target channel
        if (!channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Der ausgewählte Kanal ist kein Textkanal.',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder();

        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        if (color) {
            try {
                embed.setColor(color);
            } catch (e) {
                return interaction.reply({
                    content: '❌ Ungültiger Hex-Farbcode. Bitte verwende das Format #RRGGBB.',
                    ephemeral: true
                });
            }
        }
        if (footer) embed.setFooter({ text: footer });
        if (image) embed.setImage(image.url);
        if (thumbnail) embed.setThumbnail(thumbnail.url);

        // Validation: Embed must have at least some content
        if (!title && !description && !image && !thumbnail && !footer) {
            return interaction.reply({
                content: '❌ Das Embed muss mindestens einen Titel, eine Beschreibung, ein Bild oder einen Footer enthalten.',
                ephemeral: true
            });
        }

        try {
            await channel.send({ embeds: [embed] });
            await interaction.reply({
                content: `✅ Embed erfolgreich in ${channel} gesendet!`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Beim Senden der Nachricht ist ein Fehler aufgetreten. Bitte prüfe meine Berechtigungen im Zielkanal.',
                ephemeral: true
            });
        }
    },
};
