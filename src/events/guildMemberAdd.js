const { 
  Events, 
  EmbedBuilder 
} = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member, client) {
    try {
      const { locale } = require('../index.js');
      
      
      const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
      
      if (!welcomeChannelId) {
        console.error('Welcome channel ID is not set in the environment variables.');
        return;
      }
      
      
      const welcomeChannel = await member.guild.channels.fetch(welcomeChannelId).catch(() => null);
      
      if (!welcomeChannel) {
        console.error(`Welcome channel with ID ${welcomeChannelId} not found.`);
        return;
      }
      
      
      const creationTimestamp = Math.floor(member.user.createdAt.getTime() / 1000);
      const joinTimestamp = Math.floor(member.joinedAt.getTime() / 1000);
      
      
      const now = new Date();
      const creationTime = member.user.createdAt.getTime();
      const diffTime = Math.abs(now - creationTime);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffMonths / 12);
      
      let creationRelative;
      if (diffYears > 0) {
        creationRelative = `\`${diffYears} yıl ${diffMonths % 12} ay\``;
      } else if (diffMonths > 0) {
        creationRelative = `\`${diffMonths} ay ${diffDays % 30} gün\``;
      } else {
        creationRelative = `\`${diffDays} gün\``;
      }
      
      
      const joinDiffTimeMs = Math.abs(now - member.joinedAt);
      const joinDiffHours = Math.floor(joinDiffTimeMs / (1000 * 60 * 60));
      const joinDiffMinutes = Math.floor((joinDiffTimeMs % (1000 * 60 * 60)) / (1000 * 60));
      
      let joinRelative;
      if (joinDiffHours > 0) {
        joinRelative = `\`${joinDiffHours} saat ${joinDiffMinutes} dakika\``;
      } else {
        joinRelative = `\`${joinDiffMinutes} dakika\``;
      }
      
      
      const memberCount = `\`${member.guild.memberCount}\``;
      
      
      const greetingMessage = `Selamlar <@${member.user.id}>, Calismio'ya hoş geldin! Seninle ${memberCount} kişiyiz!

Hesabın <t:${creationTimestamp}:F> tarihinde ${creationRelative} önce oluşturulmuş, sunucumuza <t:${joinTimestamp}:R> giriş yaptın!

Satın Alma İşlemleri İçin <#1372637802604400812>`;
      
      
      await welcomeChannel.send({
        content: greetingMessage
      });
      
    } catch (error) {
      console.error('Error in guildMemberAdd event:', error);
    }
  }
};