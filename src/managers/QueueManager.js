const { Collection } = require('discord.js');

class QueueManager {
    constructor() {
        this.supportChannelId = '1464468439501504706';
        // Map to store original nicknames: userId -> originalNickname
        this.originalNicknames = new Collection();
        // Array to store queue: { userId, joinTime }
        this.queue = [];
        this.processing = false;
    }

    /**
     * Handle a member joining the support channel
     * @param {GuildMember} member 
     */
    async handleJoin(member) {
        if (member.user.bot) return;

        // Verify if already in queue to prevent duplicates
        if (this.queue.some(item => item.userId === member.id)) return;

        // Save original nickname (or username if no nickname)
        // Store it only if we haven't stored it yet (in case of quick rejoin)
        if (!this.originalNicknames.has(member.id)) {
            this.originalNicknames.set(member.id, member.nickname || member.user.username);
        }

        // Add to queue
        this.queue.push({
            userId: member.id,
            joinTime: Date.now()
        });

        // Sort queue by join time (should be sorted by default, but just to be sure)
        this.queue.sort((a, b) => a.joinTime - b.joinTime);

        await this.updateNicknames(member.guild);
    }

    /**
     * Handle a member leaving the support channel
     * @param {GuildMember} member 
     */
    async handleLeave(member) {
        const index = this.queue.findIndex(item => item.userId === member.id);
        if (index === -1) return;

        // Remove from queue
        this.queue.splice(index, 1);

        // Restore nickname
        const originalName = this.originalNicknames.get(member.id);
        if (originalName) {
            try {
                // Check permissions
                if (member.manageable && member.guild.members.me.permissions.has('ManageNicknames')) {
                    // Check if nickname is actually different to avoid API call
                    if (member.nickname !== originalName) {
                        // If original was username, set to null to reset
                        const nameToSet = originalName === member.user.username ? null : originalName;
                        await member.setNickname(nameToSet);
                    }
                }
            } catch (error) {
                console.error(`[QueueManager] Failed to restore nickname for ${member.user.tag}:`, error);
            }
            this.originalNicknames.delete(member.id);
        }

        await this.updateNicknames(member.guild);
    }

    /**
     * Update nicknames for all users in the queue
     * @param {Guild} guild 
     */
    async updateNicknames(guild) {
        if (this.processing) return;
        this.processing = true;

        try {
            for (let i = 0; i < this.queue.length; i++) {
                const { userId } = this.queue[i];
                const position = i + 1;

                try {
                    const member = await guild.members.fetch(userId);
                    if (!member) continue;

                    const originalName = this.originalNicknames.get(userId) || member.user.username;
                    const newNickname = `[${position}] ${originalName}`.substring(0, 32); // Discord limit

                    if (member.manageable && member.guild.members.me.permissions.has('ManageNicknames')) {
                        if (member.nickname !== newNickname) {
                            await member.setNickname(newNickname);
                        }
                    } else {
                        console.warn(`[QueueManager] Cannot manage nickname for ${member.user.tag}`);
                    }
                } catch (err) {
                    console.error(`[QueueManager] Error updating user ${userId}:`, err);
                }
            }
        } finally {
            this.processing = false;
        }
    }
}

module.exports = new QueueManager();
