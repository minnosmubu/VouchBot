require('dotenv').config();
const fs = require('fs');
const path = require('path');
require("./events/debugcheck")
const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  Collection, 
  REST, 
  Routes,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember
  ]
});


const OWNER_ID = process.env.OWNER_ID;
const DATA_PATH = path.join(__dirname, '..', 'data', 'vouches.json');
const LOCALE_PATH = path.join(__dirname, 'locales', 'tr.json');


if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify({ vouches: [] }, null, 2));
  console.log('Created database file');
}


let database = require('../data/vouches.json');


let locale = {};
if (fs.existsSync(LOCALE_PATH)) {
  locale = require('./locales/tr.json');
  console.log('Loaded Turkish locale');
} else {
  console.log('Locale file not found, using default strings');
}


function saveDatabase() {
  fs.writeFileSync(DATA_PATH, JSON.stringify(database, null, 2));
}


client.commands = new Collection();
const commands = [];


const commandsPath = path.join(__dirname, 'commands');
if (!fs.existsSync(commandsPath)) {
  fs.mkdirSync(commandsPath);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
    console.log(`Loaded command: ${command.data.name}`);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}


async function registerCommands(guildId = null) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  
  try {
    console.log('Started refreshing application (/) commands.');
    
    if (guildId) {
      
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guildId),
        { body: commands }
      );
      console.log(`Successfully registered commands for guild ${guildId}`);
    } else {
      
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
      );
      console.log('Successfully registered global commands.');
    }
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}


client.commands.set('register', {
  name: 'register',
  execute: async (message, args) => {
    
    if (message.author.id !== OWNER_ID) {
      return message.reply('Bu komutu sadece bot sahibi kullanabilir!');
    }
    
    const guildId = args[0] || null;
    await registerCommands(guildId);
    message.reply(`Komutlar ${guildId ? `guild ${guildId} için` : 'global olarak'} kaydedildi!`);
  }
});


client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  
  await registerCommands();
  
  client.user.setActivity('/vouch', { type: 'WATCHING' });
});


const eventsPath = path.join(__dirname, 'events');
if (!fs.existsSync(eventsPath)) {
  fs.mkdirSync(eventsPath);
}

const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client, database));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client, database));
  }
  console.log(`Loaded event: ${event.name}`);
}


client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  
  if (!command) return;
  
  try {
    await command.execute(interaction, client, database, saveDatabase);
  } catch (error) {
    console.error(error);
    const errorEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('❌ Hata')
      .setDescription('Bu komutu çalıştırırken bir hata oluştu.')
      .setTimestamp()
      .setFooter({ text: 'Developed by Krex' });
      
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(console.error);
  }
});


client.on('messageCreate', async message => {
  
  if (message.author.bot || !message.content.startsWith('!')) return;
  
  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  
  const command = client.commands.get(commandName);
  if (!command) return;
  
  try {
    await command.execute(message, args);
  } catch (error) {
    console.error('Error executing message command:', error);
    message.reply('Bu komutu çalıştırırken bir hata oluştu.').catch(console.error);
  }
});


client.login(process.env.DISCORD_TOKEN);


module.exports = {
  client,
  database,
  saveDatabase,
  OWNER_ID,
  locale
};