const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  AttachmentBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vouch')
    .setDescription('değerlendirme oluşturun')
    .addIntegerOption(option =>
      option.setName('begeni')
        .setDescription('Kaç yıldız vereceğiniz (1-5)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5)
    )
    .addStringOption(option =>
      option.setName('yorum')
        .setDescription('Yorumunuz')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('media')
        .setDescription('İsteğe bağlı: Kanıt olarak bir resim veya video yükleyin')
        .setRequired(false)
    ),
      async execute(interaction, client, database, saveDatabase) {
    const { locale } = require('../index.js');
    
    const targetUser = interaction.user; 
    const stars = interaction.options.getInteger('begeni');
    const comment = interaction.options.getString('yorum');
    const media = interaction.options.getAttachment('media');
    
    
    const vouchEntry = {
      id: Date.now().toString(),
      userId: targetUser.id,
      voucherUserPrevCheck: interaction.user.id, 
      stars,
      comment,
      mediaUrl: media ? media.url : null,
      mediaProxyUrl: media ? media.proxyURL : null,
      timestamp: new Date().toISOString(),
      guildId: interaction.guild.id
    };
    
    
    if (!database.vouches) {
      database.vouches = [];
    }
    
    database.vouches.push(vouchEntry);
    saveDatabase();
    
    
    const vouchDate = new Date(vouchEntry.timestamp);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Istanbul'
    };
    const formattedDate = vouchDate.toLocaleDateString('tr-TR', options);
    
    
    const starsDisplay = '⭐'.repeat(stars);
    const vouchEmbed = new EmbedBuilder()
      .setColor('#FFFF00')
      .setTitle(`${targetUser.username} için Değerlendirme`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Beğeni', value: `${starsDisplay} (${stars}/5)`, inline: true },
        { name: 'Değerlendiren', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Yorum', value: comment },
        { name: 'Değerlendirme Tarihi', value: formattedDate }
      )      .setTimestamp()
      .setFooter({ text: `Değerlendirme ID: ${vouchEntry.id} • Developed by Krex` });
      
    if (media) {
      
      if (media.contentType.startsWith('image/') || media.contentType.startsWith('video/')) {
        vouchEmbed.setImage(media.url);
      } else {
        vouchEmbed.addFields({ name: 'Ek Dosya', value: `[Görüntülemek için tıkla](${media.url})` });
      }
    }
      
    await interaction.reply({ 
      content: `✅ Değerlendirmeniz başarıyla kaydedildi!`, 
      embeds: [vouchEmbed] 
    });
  }
};
