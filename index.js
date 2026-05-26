const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

function createBot() {

  const bot = mineflayer.createBot({
    host: 'gold.magmanode.com',
    port: 25786,
    username: 'zeroxcheat',
    version: '1.21.4'
  });

  bot.loadPlugin(pathfinder);

  bot.on('login', () => {
    console.log('Bot connected');
  });

  bot.once('spawn', () => {

    console.log('Bot spawned');

    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);

    bot.pathfinder.setMovements(defaultMove);

    // =====================
    // Register & Login
    // =====================

    setTimeout(() => {
      bot.chat('/register 1029384756 1029384756');
    }, 3000);

    setTimeout(() => {
      bot.chat('/login 1029384756');
    }, 6000);

    // =====================
    // Anti AFK Movement
    // =====================

    setInterval(() => {

      try {

        const x = bot.entity.position.x + (Math.random() * 8 - 4);
        const z = bot.entity.position.z + (Math.random() * 8 - 4);

        bot.pathfinder.setGoal(
          new goals.GoalBlock(
            Math.floor(x),
            Math.floor(bot.entity.position.y),
            Math.floor(z)
          )
        );

        // Jump
        bot.setControlState('jump', true);

        setTimeout(() => {
          bot.setControlState('jump', false);
        }, 1000);

        // Forward movement
        if (Math.random() > 0.5) {

          bot.setControlState('forward', true);

          setTimeout(() => {
            bot.setControlState('forward', false);
          }, 3000);

        }

        // Sneak randomly
        if (Math.random() > 0.5) {

          bot.setControlState('sneak', true);

          setTimeout(() => {
            bot.setControlState('sneak', false);
          }, 2000);

        }

        // Look around
        bot.look(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI - (Math.PI / 2),
          true
        );

        console.log('Anti AFK movement');

      } catch (err) {
        console.log(err);
      }

    }, 30000);

    // =====================
    // Break Nearby Block
    // =====================

    setInterval(async () => {

      try {

        const block = bot.findBlock({
          matching: b => b && b.type !== 0,
          maxDistance: 3
        });

        if (block) {

          await bot.dig(block);

          console.log('Tried breaking block');

        }

      } catch (err) {

        console.log('Break failed');

      }

    }, 120000);

    // =====================
    // Place Block
    // =====================

    setInterval(async () => {

      try {

        const item = bot.inventory.items()[0];

        if (!item) return;

        await bot.equip(item, 'hand');

        const referenceBlock = bot.blockAt(
          bot.entity.position.offset(0, -1, 0)
        );

        if (!referenceBlock) return;

        await bot.placeBlock(referenceBlock, {
          x: 1,
          y: 0,
          z: 0
        });

        console.log('Tried placing block');

      } catch (err) {

        console.log('Place failed');

      }

    }, 180000);

    // =====================
    // Auto Messages
    // =====================

    setInterval(() => {

      bot.chat('Subscribe to Mr_Zer0 and ItzFantom_MC');
      bot.chat('Server active log sent 😎');

    }, 1800000);

    // =====================
    // Anti Spam Auto Mute
    // =====================

    const spamMap = {};

    bot.on('chat', (username, message) => {

      if (username === bot.username) return;

      if (!spamMap[username]) {

        spamMap[username] = {
          count: 0,
          last: Date.now()
        };

      }

      const user = spamMap[username];

      // Reset after 10 sec
      if (Date.now() - user.last > 10000) {
        user.count = 0;
      }

      user.count++;
      user.last = Date.now();

      console.log(`${username}: ${message}`);

      // Spam detection
      if (user.count >= 5) {

        bot.chat(`/mute ${username} 10m Spam`);

        bot.chat(`${username} muted for spam 😎`);

        console.log(`${username} muted`);

        user.count = 0;

      }

      // Anti caps
      if (
        message.length > 8 &&
        message === message.toUpperCase()
      ) {

        bot.chat(`/mute ${username} 5m Caps`);

        bot.chat(`${username} muted for caps 😎`);

      }

      // Anti repeated message
      if (
        spamMap[username].lastMessage === message
      ) {

        bot.chat(`/mute ${username} 5m Repeating`);

        bot.chat(`${username} muted for repeating 😎`);

      }

      spamMap[username].lastMessage = message;

    });

  });

  // =====================
  // Death Event
  // =====================

  bot.on('death', () => {

    console.log('Bot died');

    // Find nearest player
    const players = Object.values(bot.players)
      .filter(p =>
        p.entity &&
        p.username !== bot.username
      );

    if (players.length > 0) {

      const nearest = players.sort((a, b) => {

        const da = bot.entity.position.distanceTo(a.entity.position);
        const db = bot.entity.position.distanceTo(b.entity.position);

        return da - db;

      })[0];

      // Punish killer 😭🔥
      bot.chat('/gamemode creative zeroxcheat');

      setTimeout(() => {

        bot.chat(`/kick ${nearest.username} Killed zeroxcheat 😎`);

      }, 2000);

    }

    // Respawn
    setTimeout(() => {

      bot.chat('/respawn');

    }, 3000);

  });

  // =====================
  // Auto Reconnect
  // =====================

  bot.on('end', () => {

    console.log('Disconnected. Reconnecting...');

    setTimeout(() => {

      createBot();

    }, 10000);

  });

  bot.on('kicked', (reason) => {

    console.log('Kicked:', reason);

  });

  bot.on('error', (err) => {

    console.log(err);

  });

}

createBot();
