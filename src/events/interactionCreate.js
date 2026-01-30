const { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const TicketManager = require('../managers/TicketManager');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // --- Chat Input Commands ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
            return;
        }

        // --- Modal Submit (Ticket Setup) ---
        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith('setup_modal')) {
                const parts = interaction.customId.split(':');
                const categoryId = parts[1];
                const roleId = parts[2];
                const targetChannelId = parts[3];

                const title = interaction.fields.getTextInputValue('ticketTitle');
                const description = interaction.fields.getTextInputValue('ticketDesc');
                const btnLabel = interaction.fields.getTextInputValue('btnLabel');
                const ticketNameFormat = interaction.fields.getTextInputValue('ticketName');
                let welcomeMessage = "Hallo! Ein Teammitglied wird sich bald um dich kümmern.";
                try {
                    welcomeMessage = interaction.fields.getTextInputValue('welcomeMsg');
                } catch (e) {
                    // Optional field might throw if missing? Discord JS allows getTextInputValue on optional fields.
                    // If empty string is returned, use default.
                }
                if (!welcomeMessage) welcomeMessage = "Hallo! Ein Teammitglied wird sich bald um dich kümmern.";

                const targetChannel = interaction.guild.channels.cache.get(targetChannelId);

                if (!targetChannel) {
                    return interaction.reply({ content: '❌ Der Zielkanal wurde nicht gefunden.', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(description)
                    .setColor('#00ffaaaa') // Diamond Lifeish color
                    .setFooter({ text: 'Diamond Life Support', iconURL: interaction.guild.iconURL() });

                const button = new ButtonBuilder()
                    .setCustomId('ticket_create')
                    .setLabel(btnLabel)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📩');

                const row = new ActionRowBuilder().addComponents(button);

                try {
                    const message = await targetChannel.send({ embeds: [embed], components: [row] });

                    // Save Config
                    TicketManager.createTicketConfig(message.id, {
                        categoryId,
                        roleId,
                        welcomeMessage,
                        ticketNameFormat,
                        guildId: interaction.guild.id
                    });

                    await interaction.reply({ content: `✅ Ticket System wurde erfolgreich eingerichtet in ${targetChannel}!`, ephemeral: true });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: '❌ Fehler beim Senden des Ticket-Panels.', ephemeral: true });
                }
            }
            return;
        }

        // --- Buttons (Ticket Create / Close) ---
        if (interaction.isButton()) {
            if (interaction.customId === 'ticket_create') {
                const config = TicketManager.getTicketConfig(interaction.message.id);
                if (!config) {
                    // Fallback check: sometimes people copy old embeds? Or config lost.
                    // But message ID is unique.
                    return interaction.reply({ content: '❌ Konfiguration für dieses Ticket-Panel nicht gefunden. Bitte kontaktiere einen Admin.', ephemeral: true });
                }

                const guild = interaction.guild;
                const user = interaction.user;
                const { categoryId, roleId, welcomeMessage, ticketNameFormat } = config;

                // Check Category
                const category = guild.channels.cache.get(categoryId);
                if (!category) {
                    return interaction.reply({ content: '❌ Die Ticket-Kategorie existiert nicht mehr.', ephemeral: true });
                }

                // Create Channel Name
                // Simple replacement of {user} -> username
                const channelName = ticketNameFormat.replace('{user}', user.username).substring(0, 100);

                try {
                    // Check if user already has a ticket in this category (optional advanced feature, skipping for now to keep it simpler/flexible)

                    const ticketChannel = await guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: categoryId,
                        permissionOverwrites: [
                            {
                                id: guild.id, // @everyone
                                deny: [PermissionFlagsBits.ViewChannel],
                            },
                            {
                                id: user.id,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                            },
                            {
                                id: roleId,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                            },
                            // Allow Bot itself
                            {
                                id: interaction.client.user.id,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                            }
                        ],
                    });

                    // Send Welcome Embed
                    const welcomeEmbed = new EmbedBuilder()
                        .setTitle(`Ticket: ${user.username}`)
                        .setDescription(welcomeMessage)
                        .setColor('#00ff00')
                        .addFields({ name: 'Ersteller', value: `${user}`, inline: true })
                        .setTimestamp();

                    const closeButton = new ButtonBuilder()
                        .setCustomId('ticket_close')
                        .setLabel('Ticket schließen')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒');

                    const row = new ActionRowBuilder().addComponents(closeButton);

                    await ticketChannel.send({
                        content: `<@${user.id}> <@&${roleId}>`,
                        embeds: [welcomeEmbed],
                        components: [row]
                    });

                    await interaction.reply({ content: `✅ Dein Ticket wurde erstellt: ${ticketChannel}`, ephemeral: true });

                } catch (error) {
                    console.error('Error creating ticket channel:', error);
                    await interaction.reply({ content: '❌ Fehler beim Erstellen des Tickets.', ephemeral: true });
                }

            } else if (interaction.customId === 'ticket_close') {
                // Confirm close?
                // For simplicity, verify perms (admin or ticket opener?)
                // Actually, support role and opener should be able to close.
                // Assuming button is only visible to them anyway.

                await interaction.reply({ content: '🔒 Ticket wird in 5 Sekunden geschlossen...', ephemeral: false });

                setTimeout(() => {
                    if (interaction.channel && !interaction.channel.deleted) {
                        interaction.channel.delete().catch(console.error);
                    }
                }, 5000);
            }
        }
    },
};
