const { 
  SlashCommandBuilder, 
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('degerlendirmeler')
    .setDescription('Bir kullanıcının değerlendirmelerini görüntüle')
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Değerlendirmeleri görüntülenecek kullanıcı')
        .setRequired(true)
    ),
    
  async execute(interaction, client, database) {
    const { locale } = require('../index.js');
    
    const targetUser = interaction.options.getUser('kullanici');
    
    
    const userVouches = database.vouches.filter(vouch => vouch.userId === targetUser.id);
    
    if (userVouches.length === 0) {
      const noVouchesEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(`Değerlendirme Bulunamadı`)
        .setDescription(`${targetUser.username} için henüz değerlendirme yok.`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
        
      return interaction.reply({ embeds: [noVouchesEmbed] });
    }
    
    
    const totalStars = userVouches.reduce((sum, vouch) => sum + vouch.stars, 0);
    const averageStars = totalStars / userVouches.length;
    const starsDisplay = '⭐'.repeat(Math.round(averageStars));
    
    
    const summaryEmbed = new EmbedBuilder()
      .setColor('#FFFF00')
      .setTitle(`${targetUser.username} için Değerlendirmeler`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))      .addFields(
        { name: 'Toplam Değerlendirmeler', value: userVouches.length.toString(), inline: true },
        { name: 'Ortalama Puan', value: `${starsDisplay} (${averageStars.toFixed(1)}/5)`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Developed by Krex' });
      
    
    const recentVouches = userVouches.slice(-5).reverse();
    
    recentVouches.forEach((vouch, index) => {
      const vouchStars = '⭐'.repeat(vouch.stars);
      
      
      const vouchDate = new Date(vouch.timestamp);
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Istanbul'
      };
      const formattedDate = vouchDate.toLocaleDateString('tr-TR', options);
      
      summaryEmbed.addFields({
        name: `Değerlendirme #${index + 1} - ${vouchStars}`,
        value: `${vouch.comment}\n*Değerlendiren: <@${vouch.voucherUserPrevCheck}>\nTarih: ${formattedDate}*${vouch.mediaUrl ? '\n[Medya Eki]('+vouch.mediaUrl+')' : ''}`
      });
    });
    
    
    const row = new ActionRowBuilder();
    
    if (userVouches.length > 5) {
      const viewAllButton = new ButtonBuilder()
        .setCustomId(`viewall_${targetUser.id}`)
        .setLabel('Tüm Değerlendirmeleri Görüntüle')
        .setStyle(ButtonStyle.Primary);
        
      row.addComponents(viewAllButton);
      
      await interaction.reply({ 
        embeds: [summaryEmbed],
        components: [row]
      });
    } else {
      await interaction.reply({ 
        embeds: [summaryEmbed]
      });
    }
  }
};
