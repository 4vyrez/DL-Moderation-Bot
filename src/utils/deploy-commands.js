const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const commands = [];
const commandsPath = path.join(__dirname, '../commands');

// Recursively reading command files might be overkill for now but good for consistency
// Simpler version for this utility as it usually runs standalone
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        // Note: For global commands, use Routes.applicationCommands(clientId)
        // For guild-specific commands (faster updates during dev), use Routes.applicationGuildCommands(clientId, guildId)

        // Using global commands for now as guildId might not be set in .env yet
        // If you want guild specific, add GUILD_ID to .env and change this line
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
