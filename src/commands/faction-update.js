const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const ALLOWED_ROLES = [
    '1464461234119376960', // DiamondLife RP
    '825864546899198022',  // Medical Discord RP
    '1465303406360006759'  // Police Discord RP
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('faction-update')
        .setDescription('Verwaltet Nachrichten im Fraktions-Updates Kanal.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Postet die offizielle Fraktions-Info-Nachricht.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('post')
                .setDescription('Postet ein neues Fraktions-Update.')
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
                        .setDescription('Hex-Farbe (Optional, Standard: Dunkelgold)'))),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // Role Check
        const hasRole = interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id));
        if (!hasRole) {
            return interaction.editReply({
                content: '❌ Du hast keine Berechtigung, diesen Befehl zu verwenden.'
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.channel;

        if (!channel || !channel.isTextBased()) {
            return interaction.editReply({
                content: `❌ Dieser Befehl kann nur in Textkanälen verwendet werden.`
            });
        }

        try {
            if (subcommand === 'info') {
                const embed = new EmbedBuilder()
                    .setTitle('🏴 Fraktionsupdates')
                    .setDescription(`In diesem Channel werden offizielle Mitteilungen zu allen Fraktionen auf dem Server veröffentlicht.
Die Entscheidungen werden ausschließlich durch die Fraktionsverwaltung getroffen.

Bekannt gegeben werden unter anderem:
• Aufnahme neuer Fraktionen (Start der Testphase)
• Aussprache von Fraktionswarns
• Freigabe von Fraktionen (Ende der Testphase / öffentlich spielbar)
• Auflösung von Fraktionen

⚖️ **Regelung zu Fraktionswarns:**
• Jede Fraktion kann maximal zwei (2) Fraktionswarns erhalten.
• Mit dem dritten Fraktionswarn gilt die Fraktion als automatisch aufgelöst.
• Erhält eine Fraktion während der Testphase einen Fraktionswarn, wird diese unmittelbar und ohne weitere Verwarnung aufgelöst.

🔒 **Wichtige Hinweise:**
• Alle Entscheidungen erfolgen nach Ermessen der Fraktionsverwaltung.
• Die Aufnahme in die Testphase stellt keine Garantie für eine dauerhafte Zulassung dar.
• Es besteht kein Anspruch auf öffentliche Begründung oder Diskussion.
• Interne Bewertungen, Entscheidungsgrundlagen und Abläufe bleiben vertraulich.

Mit freundlichen Grüßen
Fraktionsverwaltung & Stv. Fraktionsverwaltung`)
                    .setColor('#A0522D') // Sienna (Brownish/Goldish)
                    .setFooter({ text: 'Euer DiamondLife Team!' });

                await channel.send({ embeds: [embed] });
                return interaction.editReply({ content: '✅ Fraktions-Info-Nachricht wurde gesendet!' });

            } else if (subcommand === 'post') {
                const title = interaction.options.getString('title');
                const message = interaction.options.getString('message');
                const color = interaction.options.getString('color') || '#A0522D';

                const embed = new EmbedBuilder()
                    .setTitle(`🏴 ${title}`)
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
