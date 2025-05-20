const { 
  SlashCommandBuilder, 
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('geriyukle')
    .setDescription('Bir yedekten değerlendirmeleri geri yükle (Sadece Bot Sahibi)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addAttachmentOption(option =>
      option.setName('yedek')
        .setDescription('Geri yüklenecek yedek dosyası')
        .setRequired(true)
    ),
    
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
    
    await interaction.deferReply({ ephemeral: true });
    
    try {      const backupFile = interaction.options.getAttachment('yedek');
      
      
      if (!backupFile.name.endsWith('.json')) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Geçersiz Dosya')
          .setDescription('Yedek dosyası bir JSON dosyası olmalıdır!')
          .setTimestamp()
          .setFooter({ text: 'Developed by Krex' });
          
        return interaction.editReply({ embeds: [errorEmbed] });
      }
      
      
      const response = await fetch(backupFile.url);
      if (!response.ok) {
        throw new Error(`Failed to download backup file: ${response.statusText}`);
      }
      
      const backupData = await response.json();
        
      if (!backupData.vouches || !Array.isArray(backupData.vouches)) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Geçersiz Yedek')
          .setDescription('Yedek dosyası geçerli değerlendirme verisi içermiyor!')
          .setTimestamp()
          .setFooter({ text: 'Developed by Krex' });
          
        return interaction.editReply({ embeds: [errorEmbed] });
      }
      
      
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const backupDir = path.join(__dirname, '..', '..', 'data', 'backups');
      
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const autoBackupPath = path.join(backupDir, `pre-restore-backup-${timestamp}.json`);
      fs.writeFileSync(autoBackupPath, JSON.stringify(database, null, 2));
      
      
      database.vouches = backupData.vouches;
      saveDatabase();      
      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Yedek Geri Yüklendi')
        .setDescription(`Değerlendirme veritabanı başarıyla geri yüklendi.`)
        .addFields(
          { name: 'Toplam Değerlendirmeler', value: database.vouches.length.toString() },
          { name: 'Yedek Dosyası', value: backupFile.name },
          { name: 'Otomatik Yedek', value: `pre-restore-backup-${timestamp}.json` }
        )
        .setTimestamp()
        .setFooter({ text: 'Developed by Krex' });
        
      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(error);
        const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Hata')
        .setDescription(`Yedek geri yüklenirken bir hata oluştu: ${error.message}`)
        .setTimestamp()
        .setFooter({ text: 'Developed by Krex' });
        
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};
