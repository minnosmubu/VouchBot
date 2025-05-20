const { 
  SlashCommandBuilder, 
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('istatistikler')
    .setDescription('Sunucunun değerlendirme istatistiklerini görüntüle'),
    
  async execute(interaction, client, database) {
    const { locale } = require('../index.js');
    
    
    const { vouches } = database;
    
    
    const guildVouches = vouches.filter(vouch => vouch.guildId === interaction.guild.id);
    
    if (guildVouches.length === 0) {
      const noVouchesEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(`Değerlendirme Bulunamadı`)
        .setDescription(`Bu sunucu için henüz değerlendirme kaydedilmemiş.`)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setTimestamp();
        
      return interaction.reply({ embeds: [noVouchesEmbed] });
    }
    
    
    const totalVouches = guildVouches.length;
    
    
    const uniqueReceivers = [...new Set(guildVouches.map(vouch => vouch.userId))];
    const totalReceivers = uniqueReceivers.length;
    
    
    const uniqueVouchers = [...new Set(guildVouches.map(vouch => vouch.voucherUserPrevCheck))];
    const totalVouchers = uniqueVouchers.length;
    
    
    const totalStars = guildVouches.reduce((sum, vouch) => sum + vouch.stars, 0);
    const averageRating = totalStars / totalVouches;
    
    
    const ratings = {
      1: guildVouches.filter(vouch => vouch.stars === 1).length,
      2: guildVouches.filter(vouch => vouch.stars === 2).length,
      3: guildVouches.filter(vouch => vouch.stars === 3).length,
      4: guildVouches.filter(vouch => vouch.stars === 4).length,
      5: guildVouches.filter(vouch => vouch.stars === 5).length
    };
    
    
    const receiverCounts = {};
    guildVouches.forEach(vouch => {
      receiverCounts[vouch.userId] = (receiverCounts[vouch.userId] || 0) + 1;
    });
    
    let topReceiverUserId = null;
    let topReceiverCount = 0;
    
    for (const [userId, count] of Object.entries(receiverCounts)) {
      if (count > topReceiverCount) {
        topReceiverUserId = userId;
        topReceiverCount = count;
      }
    }
    
    
    const voucherCounts = {};
    guildVouches.forEach(vouch => {
      voucherCounts[vouch.voucherUserPrevCheck] = (voucherCounts[vouch.voucherUserPrevCheck] || 0) + 1;
    });
    
    let topVoucherUserId = null;
    let topVoucherCount = 0;
    
    for (const [userId, count] of Object.entries(voucherCounts)) {
      if (count > topVoucherCount) {
        topVoucherUserId = userId;
        topVoucherCount = count;
      }
    }
    
    
    const topReceiver = topReceiverUserId ? await client.users.fetch(topReceiverUserId).catch(() => null) : null;
    const topVoucher = topVoucherUserId ? await client.users.fetch(topVoucherUserId).catch(() => null) : null;
    
    
    const recentVouchDate = new Date(guildVouches[guildVouches.length - 1].timestamp);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Istanbul'
    };
    const formattedRecentDate = recentVouchDate.toLocaleDateString('tr-TR', options);
    
    
    const statsEmbed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(`📊 ${interaction.guild.name} için Değerlendirme İstatistikleri`)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'Toplam Değerlendirmeler', value: totalVouches.toString(), inline: true },
        { name: 'Değerlendirme Alan Kullanıcılar', value: totalReceivers.toString(), inline: true },
        { name: 'Değerlendirme Yapan Kullanıcılar', value: totalVouchers.toString(), inline: true },
        { name: 'Ortalama Puan', value: `${averageRating.toFixed(2)} ⭐`, inline: true },
        { name: 'En Son Değerlendirme', value: formattedRecentDate, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: 'Puan Dağılımı', value: `5 ⭐: ${ratings[5]}\n4 ⭐: ${ratings[4]}\n3 ⭐: ${ratings[3]}\n2 ⭐: ${ratings[2]}\n1 ⭐: ${ratings[1]}` },
        { name: 'En Çok Değerlendirilen Kullanıcı', value: topReceiver ? `${topReceiver.username} (${topReceiverCount} değerlendirme)` : 'Yok', inline: true },
        { name: 'En Aktif Değerlendirici', value: topVoucher ? `${topVoucher.username} (${topVoucherCount} değerlendirme)` : 'Yok', inline: true }
      )      .setFooter({ text: 'Son güncelleme • Developed by Krex' })
      .setTimestamp();
      
    await interaction.reply({ embeds: [statsEmbed] });
  }
};
