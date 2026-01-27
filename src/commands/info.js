const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const packageJson = require('../../package.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Zeigt Informationen über den Bot und seine Funktionen an.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x0099FF) // Diamond Blue-ish
            .setTitle('🛡️ Diamond Life Moderation Bot')
            .setDescription('Der ultimative Wächter für DiamondLife. Ich sorge für Sicherheit, Ordnung und faire Fairness im Roleplay.')
            .addFields(
                { name: '🤖 Über mich', value: 'Ich bin ein speziell entwickelter Bot für DiamondLife, um die Administration zu unterstützen und den Server vor Regelverstößen zu schützen.' },
                { name: '🛠️ Version', value: packageJson.version, inline: true },
                { name: '📚 Library', value: 'Discord.js v14', inline: true },
                { name: '⚡ Ping', value: `${interaction.client.ws.ping}ms`, inline: true },
            )
            .setFooter({ text: 'Diamond Life RP • Security System', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
