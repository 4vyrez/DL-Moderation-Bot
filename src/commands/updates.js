const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const ALLOWED_ROLE_ID = '1464569438689955932';
const TARGET_CHANNEL_ID = '1464686808888639756';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('updates')
        .setDescription('Postet ein offizielles Bot-Update.')
        .addStringOption(option =>
            option.setName('version')
                .setDescription('Die Version des Updates (z.B. v1.2.0)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Titel des Updates (z.B. "Security Update")')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('added')
                .setDescription('Was wurde hinzugefügt? (Benutze \\n für Zeilenumbrüche)'))
        .addStringOption(option =>
            option.setName('changed')
                .setDescription('Was wurde geändert? (Benutze \\n für Zeilenumbrüche)'))
        .addStringOption(option =>
            option.setName('fixed')
                .setDescription('Was wurde gefixt? (Benutze \\n für Zeilenumbrüche)'))
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Ein Banner-Bild für das Update'))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Eine zusätzliche Nachricht an die User (Intro/Outro)')),
    async execute(interaction) {
        // 1. Permission Check
        if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
            return interaction.reply({
                content: '❌ Du hast keine Berechtigung, diesen Befehl zu verwenden.',
                ephemeral: true
            });
        }

        // 2. Data Retrieval
        const version = interaction.options.getString('version');
        const title = interaction.options.getString('title');
        const added = interaction.options.getString('added');
        const changed = interaction.options.getString('changed');
        const fixed = interaction.options.getString('fixed');
        const image = interaction.options.getAttachment('image');
        const message = interaction.options.getString('message');

        // 3. Helper to format list items nicely
        const formatList = (text) => {
            if (!text) return null;
            // Split by newline, trim, and add pretty bullet points if not present
            return text.split('\\n').map(line => {
                line = line.trim();
                // If line already starts with a bullet-like char, simple trim
                if (/^[•\-\*+]/.test(line)) return line;
                return `• ${line}`;
            }).join('\n');
        };

        // 4. Construct Embed
        const embed = new EmbedBuilder()
            .setColor(0x5865F2) // Discord Blurple / Diamond Blue-ish
            .setAuthor({
                name: 'DiamondLife Bot Updates',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTitle(`${title} (${version})`)
            .setTimestamp()
            .setFooter({ text: 'Bleibt immer auf dem neuesten Stand!' });

        if (message) {
            embed.setDescription(`${message}`);
        } else {
            embed.setDescription(`Ein neues Update **${version}** ist da! Hier ist, was sich geändert hat:`);
        }

        if (added) {
            embed.addFields({ name: '🆕 Hinzugefügt', value: formatList(added) });
        }
        if (changed) {
            embed.addFields({ name: '🔄 Geändert', value: formatList(changed) });
        }
        if (fixed) {
            embed.addFields({ name: '🛠️ Gefixt', value: formatList(fixed) });
        }

        if (image) {
            embed.setImage(image.url);
        }

        // 5. Send to Channel
        try {
            const channel = await interaction.client.channels.fetch(TARGET_CHANNEL_ID);
            if (!channel || !channel.isTextBased()) {
                throw new Error('Zielkanal nicht gefunden oder kein Textkanal.');
            }

            await channel.send({ content: '@everyone', embeds: [embed] });

            // 6. Confirm to User
            await interaction.reply({
                content: `✅ Update **${version}** erfolgreich in ${channel} gepostet!`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Fehler beim Senden des Updates:', error);
            await interaction.reply({
                content: `❌ Fehler beim Senden des Updates: ${error.message}`,
                ephemeral: true
            });
        }
    },
};
