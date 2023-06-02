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
      user.hasMany(models.session,{
        foreignKey: 'userId'
      })
      user.hasMany(models.sports,{
        foreignKey: 'userId'
      })
      // define association here
    }
    static async getUser(userId) {
      return this.findByPk(userId);
    }

    static async AddsessionIdinuser(sessionId, userId) {
      try {
        const getUser = await this.getUser(userId);
        getUser.sessionId.push(sessionId);
        return this.update(
          {
            sessionId: getUser.sessionId,
          },
          {
            where: {
              id: userId,
            },
          }
        );
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
    

    static async removeSessionId(sessionId, userId) {
      const user = await this.getUser(userId);
      const index = user.sessionId.indexOf(sessionId);
      if (index !== -1) {
        user.sessionId.splice(index, 1);
      }
      return this.update(
        {
          sessionId: user.sessionId,
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
    fname: DataTypes.STRING,
    lname: DataTypes.STRING,
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