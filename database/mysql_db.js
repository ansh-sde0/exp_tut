const { Sequelize } = require('sequelize');
module.exports = new Sequelize('mylo', "root", "Ansh2222##",{
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
    logging: true,
    dialectOptions: {
        charset: 'utf8mb4',
    },
});
