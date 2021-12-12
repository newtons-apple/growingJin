const { User, Item, Player } = require('./models');

const init = async () => {
    await User.deleteMany();
    await Item.deleteMany();
    await Player.deleteMany();

    console.log('completed');
}

init();