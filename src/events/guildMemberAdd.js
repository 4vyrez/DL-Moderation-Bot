const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // Target Guild ID
        const targetGuildId = '1465002396257222868';

        // Roles to assign
        const rolesToAssign = [
            '1465304151499210876',
            '1465659771477557406'
        ];

        if (member.guild.id === targetGuildId) {
            try {
                await member.roles.add(rolesToAssign);
                console.log(`Auto-assigned roles to ${member.user.tag} in guild ${member.guild.name}`);
            } catch (error) {
                console.error(`Failed to auto-assign roles to ${member.user.tag}:`, error);
            }
        }
    },
};
