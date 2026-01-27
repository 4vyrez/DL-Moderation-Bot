const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const ALLOWED_ROLES = [
    '1464461234119376960', // DiamondLife RP
    '825864546899198022',  // Medical Discord RP
    '1465303406360006759'  // Police Discord RP
];

const TARGET_CHANNEL_ID = '1464477948223684764';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team-update')
        .setDescription('Verwaltet Nachrichten im Team-Updates Kanal.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Postet die offizielle Info/Regel-Nachricht in den Kanal.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('post')
                .setDescription('Postet ein neues Update.')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Titel des Updates')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Inhalt des Updates')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('Hex-Farbe (Optional, Standard: Gold)'))),

    async execute(interaction) {
        // Defer reply immediately to prevent "Application not responding"
        await interaction.deferReply({ ephemeral: true });

        // Role Check
        const hasRole = interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id));
        if (!hasRole) {
            return interaction.editReply({
                content: '❌ Du hast keine Berechtigung, diesen Befehl zu verwenden.'
            });
        }

        const subcommand = interaction.options.getSubcommand();
        // Use the channel where the command was called
        const channel = interaction.channel;

        if (!channel || !channel.isTextBased()) {
            return interaction.editReply({
                content: `❌ Dieser Befehl kann nur in Textkanälen verwendet werden.`
            });
        }

        try {
            if (subcommand === 'info') {
                const embed = new EmbedBuilder()
                    .setTitle('📢 Team-Updates')
                    .setDescription(`In diesem Channel werden offizielle Mitteilungen des Serverteams veröffentlicht.
Dazu gehören insbesondere Informationen über:

• Aufnahmen ins Team
• Beförderungen (Upranks)
• Degradierungen (Downranks)
• Entfernungen aus dem Team
• Allgemeine Änderungen innerhalb der Teamstruktur

🔒 **Wichtige Hinweise:**
• Alle hier veröffentlichten Informationen sind offiziell und verbindlich.
• Entscheidungen zu Teampositionen erfolgen ausschließlich durch die Serverleitung.
• Es besteht kein Anspruch auf Begründung von Personalentscheidungen.
• Diskussionen, Kommentare oder öffentliche Nachfragen zu Teamentscheidungen sind nicht erwünscht, sofern diese nicht ausdrücklich freigegeben werden.
• Interne Gründe, Abläufe oder Bewertungen bleiben vertraulich.

Dieser Channel dient ausschließlich der Information.
Fragen oder Anliegen sind privat und über die vorgesehenen Kontaktwege zu klären.`)
                    .setColor('#DAA520') // Golden Rod
                    .setFooter({ text: 'Euer DiamondLife Team!' });

                await channel.send({ embeds: [embed] });
                return interaction.editReply({ content: '✅ Info-Nachricht wurde gesendet!' });

            } else if (subcommand === 'post') {
                const title = interaction.options.getString('title');
                const message = interaction.options.getString('message');
                const color = interaction.options.getString('color') || '#DAA520';

                const embed = new EmbedBuilder()
                    .setTitle(`📢 ${title}`)
                    .setDescription(message)
                    .setColor(color)
                    .setFooter({ text: 'Euer DiamondLife Team!' })
                    .setTimestamp();

                await channel.send({ embeds: [embed] });
                return interaction.editReply({ content: `✅ Update "${title}" wurde gesendet!` });
            }
        } catch (error) {
            console.error(error);
            return interaction.editReply({
                content: '❌ Beim Senden der Nachricht ist ein Fehler aufgetreten. Bitte prüfe meine Berechtigungen in diesem Kanal.'
            });
        }
    },
};
