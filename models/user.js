'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      user.hasMany(models.session, {
        foreignKey: "userId",
      });
      user.hasMany(models.sports, {
        foreignKey: "userId",
      });
      // define association here
    }
    static async getUser(userId) {
      return this.findByPk(userId);
    }
    static async addSessionIdInUser(sessionId, userId) {
      const getUser = await this.getUser(userId);
      const updatedSessionId = [...getUser.sessionId, sessionId];
      return this.update(
        {
          sessionId: updatedSessionId,
        },
        {
          where: {
            id: userId,
          },
        }
      );
    }
    
    static async removeSessionId(sessionId, userId) {
      const getUser = await this.getUser(userId);
      const updatedSessionId = getUser.sessionId.filter((id) => id !== sessionId);
      return this.update(
        {
          sessionId: updatedSessionId,
        },
        {
          where: {
            id: userId,
          },
        }
      );
    }

  }
  user.init({
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    sessionId: DataTypes.ARRAY(DataTypes.INTEGER),
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};