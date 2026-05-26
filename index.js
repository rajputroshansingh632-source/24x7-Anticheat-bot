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

    // Register
    setTimeout(() => {
      bot.chat('/register 1029384756 1029384756');
    }, 3000);

    // Login
    setTimeout(() => {
      bot.chat('/login 1029384756');
    }, 6000);

    // Random movement every 30 sec
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

    // Try breaking nearby block
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

    // Try placing block
    setInterval(async () => {

      try {

        const item = bot.inventory.items()[0];

        if (!item) return;

        await bot.equip(item, 'hand');

        const referenceBlock = bot.blockAt(
          bot.entity.position.offset(0, -1, 0)
        );

        if (!referenceBlock) return;

        await bot.placeBlock(referenceBlock, { x: 1, y: 0, z: 0 });

        console.log('Tried placing block');

      } catch (err) {
        console.log('Place failed');
      }

    }, 180000);

    // Auto messages every 30 mins
    setInterval(() => {

      bot.chat('Subscribe to Mr_Zer0 and ItzFantom_MC');
      bot.chat('Server active log sent 😎');

    }, 1800000);

  });

  // Respawn
  bot.on('death', () => {

    console.log('Bot died');

    setTimeout(() => {
      bot.chat('/respawn');
    }, 3000);

  });

  // Auto reconnect
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
