const { REST, Routes } = require('discord.js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const clientId = process.env.CLIENT_ID;

(async () => {
    try {
        console.log('Started deleting all commands.');

        // 1. Delete all global commands
        console.log('Deleting global commands...');
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log('Successfully deleted all global commands.');

        // 2. Delete guild commands (optional but recommended to clear ghosts)
        // Since we don't have all guild IDs, we can't easily iterate all guilds unless we use the client.
        // But for the user 's specific issue, global reset is the most important step.
        // If the user provided a specific GUILD_ID in env, we could use it:
        if (process.env.GUILD_ID) {
            console.log(`Deleting guild commands for guild ${process.env.GUILD_ID}...`);
            await rest.put(Routes.applicationGuildCommands(clientId, process.env.GUILD_ID), { body: [] });
            console.log('Successfully deleted guild commands.');
        } else {
            console.log('No GUILD_ID found in .env, skipping specific guild command deletion. (Global clear should handle most cases)');
        }

        console.log('All commands cleared. Now you should run the deploy script again.');
    } catch (error) {
        console.error(error);
    }
})();
