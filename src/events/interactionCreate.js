const { 
  Events, 
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client, database) {
    
    if (interaction.isButton()) {
      
      if (interaction.customId.startsWith('viewall_')) {
        const userId = interaction.customId.split('_')[1];
        
        
        const userVouches = database.vouches.filter(vouch => vouch.userId === userId);
        
        if (userVouches.length === 0) {
          return interaction.update({ 
            content: 'No vouches found for this user.',
            embeds: [],
            components: []
          });
        }
        
        
        const targetUser = await client.users.fetch(userId).catch(() => null);
        
        if (!targetUser) {
          return interaction.update({ 
            content: 'Error: User not found.',
            embeds: [],
            components: []
          });
        }
        
        
        const vouchesPerPage = 5;
        const pages = [];
        
        for (let i = 0; i < userVouches.length; i += vouchesPerPage) {
          const pageVouches = userVouches.slice(i, i + vouchesPerPage);
          pages.push(pageVouches);
        }
        
        
        const totalPages = pages.length;          
          const generatePageEmbed = (pageIndex) => {
            const embed = new EmbedBuilder()
              .setColor('#FFFF00')
              .setTitle(`${targetUser.username} için Değerlendirmeler`)
              .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
              .setFooter({ text: `Sayfa ${pageIndex + 1}/${totalPages} • Toplam Değerlendirme: ${userVouches.length}` })
              .setTimestamp();
              
            const pageVouches = pages[pageIndex];
            
            pageVouches.forEach((vouch, index) => {
              const vouchStars = '⭐'.repeat(vouch.stars);
              const voucherText = `<@${vouch.voucherUserPrevCheck}>`;
              
              
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
              
              embed.addFields({
                name: `Değerlendirme #${i + index + 1} - ${vouchStars} (${vouch.stars}/5)`,
                value: `${vouch.comment}\n*Değerlendiren: ${voucherText}\nTarih: ${formattedDate}*${vouch.mediaUrl ? `\n[Medya](${vouch.mediaUrl})` : ''}`
              });
            });
            
            return embed;
          };
          
          
          const createButtons = (currentPage) => {
            const row = new ActionRowBuilder();
            
            const firstButton = new ButtonBuilder()
              .setCustomId(`page_${userId}_0`)
              .setLabel('⏮️ İlk')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(currentPage === 0);
              
            const prevButton = new ButtonBuilder()
              .setCustomId(`page_${userId}_${currentPage - 1}`)
              .setLabel('◀️ Önceki')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(currentPage === 0);
              
            const nextButton = new ButtonBuilder()
              .setCustomId(`page_${userId}_${currentPage + 1}`)
              .setLabel('Sonraki ▶️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(currentPage === totalPages - 1);
              
            const lastButton = new ButtonBuilder()
              .setCustomId(`page_${userId}_${totalPages - 1}`)
              .setLabel('Son ⏭️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(currentPage === totalPages - 1);
              
            row.addComponents(firstButton, prevButton, nextButton, lastButton);
          
          return row;
        };
        
        
        const initialPage = 0;
        const initialEmbed = generatePageEmbed(initialPage);
        const initialButtons = createButtons(initialPage);
        
        await interaction.update({ 
          embeds: [initialEmbed],
          components: [initialButtons]
        });
      }
      
      
      else if (interaction.customId.startsWith('page_')) {
        const parts = interaction.customId.split('_');
        const userId = parts[1];
        const pageIndex = parseInt(parts[2]);
        
        
        const userVouches = database.vouches.filter(vouch => vouch.userId === userId);
        
        if (userVouches.length === 0) {
          return interaction.update({ 
            content: 'No vouches found for this user.',
            embeds: [],
            components: []
          });
        }
        
        
        const targetUser = await client.users.fetch(userId).catch(() => null);
        
        if (!targetUser) {
          return interaction.update({ 
            content: 'Error: User not found.',
            embeds: [],
            components: []
          });
        }
        
        
        const vouchesPerPage = 5;
        const pages = [];
        
        for (let i = 0; i < userVouches.length; i += vouchesPerPage) {
          const pageVouches = userVouches.slice(i, i + vouchesPerPage);
          pages.push(pageVouches);
        }
        
        
        const totalPages = pages.length;          
          const generatePageEmbed = (pageIndex) => {
            const embed = new EmbedBuilder()
              .setColor('#FFFF00')
              .setTitle(`${targetUser.username} için Değerlendirmeler`)
              .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
              .setFooter({ text: `Sayfa ${pageIndex + 1}/${totalPages} • Toplam Değerlendirme: ${userVouches.length}` })
              .setTimestamp();
              
            const pageVouches = pages[pageIndex];
            const startIndex = pageIndex * vouchesPerPage;
            
            pageVouches.forEach((vouch, index) => {
              const vouchStars = '⭐'.repeat(vouch.stars);
              const voucherText = `<@${vouch.voucherUserPrevCheck}>`;
              
              
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
              
              embed.addFields({
                name: `Değerlendirme #${startIndex + index + 1} - ${vouchStars} (${vouch.stars}/5)`,
                value: `${vouch.comment}\n*Değerlendiren: ${voucherText}\nTarih: ${formattedDate}*${vouch.mediaUrl ? `\n[Medya](${vouch.mediaUrl})` : ''}`
              });
            });
            
            return embed;
          };
          
          
          const createButtons = (currentPage) => {
            const row = new ActionRowBuilder();
            
            const firstButton = new ButtonBuilder()
              .setCustomId(`page_${userId}_0`)
              .setLabel('⏮️ İlk')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(currentPage === 0);
              
            const prevButton = new ButtonBuilder()
              .setCustomId(`page_${userId}_${currentPage - 1}`)
              .setLabel('◀️ Önceki')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(currentPage === 0);
              
            const nextButton = new ButtonBuilder()
              .setCustomId(`page_${userId}_${currentPage + 1}`)
              .setLabel('Sonraki ▶️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(currentPage === totalPages - 1);
              
            const lastButton = new ButtonBuilder()
              .setCustomId(`page_${userId}_${totalPages - 1}`)
              .setLabel('Son ⏭️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(currentPage === totalPages - 1);
            
          row.addComponents(firstButton, prevButton, nextButton, lastButton);
          
          return row;
        };
        
        
        const pageEmbed = generatePageEmbed(pageIndex);
        const pageButtons = createButtons(pageIndex);
        
        await interaction.update({ 
          embeds: [pageEmbed],
          components: [pageButtons]
        });
      }
    }
  }
};
