const { 
  SlashCommandBuilder, 
  EmbedBuilder,
  PermissionFlagsBits,
  AttachmentBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {  data: new SlashCommandBuilder()
    .setName('yedekle')
    .setDescription('Değerlendirme veritabanını yedekle (Sadece Bot Sahibi)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
  async execute(interaction, client, database, saveDatabase) {
    const { OWNER_ID } = require('../index.js');
      
    if (interaction.user.id !== OWNER_ID) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Erişim Reddedildi')
        .setDescription('Bu komutu sadece bot sahibi kullanabilir!')
        .setTimestamp()
        .setFooter({ text: 'Developed by Krex' });
        
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    
    try {
      
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const backupDir = path.join(__dirname, '..', '..', 'data', 'backups');
      
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const backupPath = path.join(backupDir, `vouches-backup-${timestamp}.json`);
      
      
      fs.writeFileSync(backupPath, JSON.stringify(database, null, 2));
      
      
      const attachment = new AttachmentBuilder(backupPath, { name: `vouches-backup-${timestamp}.json` });
        
      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Yedek Oluşturuldu')
        .setDescription(`Değerlendirme veritabanının yedeği başarıyla oluşturuldu.`)
        .addFields(
          { name: 'Toplam Değerlendirmeler', value: database.vouches.length.toString() },
          { name: 'Zaman Damgası', value: timestamp }
        )
        .setTimestamp()
        .setFooter({ text: 'Developed by Krex' });
        
      await interaction.reply({ 
        embeds: [successEmbed],
        files: [attachment],
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
        const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Hata')
        .setDescription(`Yedekleme oluşturulurken bir hata oluştu: ${error.message}`)
        .setTimestamp()
        .setFooter({ text: 'Developed by Krex' });
        
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
