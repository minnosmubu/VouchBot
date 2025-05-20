const { 
  SlashCommandBuilder, 
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletevouch')
    .setDescription('Delete a vouch (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('id')
        .setDescription('The ID of the vouch to delete')
        .setRequired(true)
    ),
    
  async execute(interaction, client, database, saveDatabase) {
    const vouchId = interaction.options.getString('id');
    const { OWNER_ID } = require('../index.js');
    
    
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && 
        interaction.user.id !== OWNER_ID) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Access Denied')
        .setDescription('You do not have permission to use this command!')
        .setTimestamp();
        
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    
    
    const vouchIndex = database.vouches.findIndex(vouch => vouch.id === vouchId);
    
    if (vouchIndex === -1) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Not Found')
        .setDescription(`No vouch found with ID: ${vouchId}`)
        .setTimestamp();
        
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    
    
    const deletedVouch = database.vouches[vouchIndex];
    const targetUser = await client.users.fetch(deletedVouch.userId).catch(() => null);
    const voucherUser = await client.users.fetch(deletedVouch.voucherUserPrevCheck).catch(() => null);
    
    
    database.vouches.splice(vouchIndex, 1);
    saveDatabase();
    
    
    const successEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Vouch Deleted')
      .setDescription(`Successfully deleted vouch with ID: ${vouchId}`)
      .addFields(
        { name: 'For User', value: targetUser ? `${targetUser.username}` : 'Unknown User', inline: true },
        { name: 'By User', value: voucherUser ? `${voucherUser.username}` : 'Unknown User', inline: true },
        { name: 'Rating', value: `${'⭐'.repeat(deletedVouch.stars)} (${deletedVouch.stars}/5)`, inline: true },
        { name: 'Comment', value: deletedVouch.comment }
      )      .setTimestamp()
      .setFooter({ text: `${interaction.user.username} tarafından silindi • Developed by Krex` });
      
    if (deletedVouch.mediaUrl) {
      successEmbed.addFields({ name: 'Media', value: `[Link](${deletedVouch.mediaUrl})` });
    }
    
    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
  }
};
