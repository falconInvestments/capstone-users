const { Sequelize, DataTypes } = require('sequelize');

let sequelize = null;
if (process && process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  sequelize = new Sequelize({
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    dialect: 'postgres',
  });
}

sequelize
  .authenticate()
  .then(() => {
    console.log('Successfully connected to User RDS.');
  })
  .catch(error => {
    console.error('User RDS connection error:', error);
  });

const db = {};
db.sequelize = sequelize;

db.Users = require('./userModel')(sequelize, DataTypes);

db.sequelize
  .sync()
  .then(() => {
    console.log('Successfully synced Users RDS with Sequelize.');
  })
  .catch(error => {
    console.error('Sequelize sync error:', error);
  });

module.exports = db;
