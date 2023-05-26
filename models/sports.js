'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class sports extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      sports.belongsTo(models.user, {
        foreignKey: "userId",
      });
      // define association here
    }

    static createsports({sport, userId}){
      return this.create({
        sport_name: sport,
        userId
      })
    }
    static getSports(){
      return this.findAll();
    }
    static findSportById(id) {
      return this.findByPk(id);
    }
    static async deleteSport(id) {
      try {
        const rowDeleted = await this.destroy({
          where: {
            id
          },
        });
    
        if (rowDeleted === 1) {
          console.log("Deleted successfully");
        }
      } catch (err) {
        console.log(err);
      }
    }

    static async findSportByName(sportname, userId) {
      try {
          const getSport = await this.findAll({
              where: {
                  sport_name: sportname,
                  userId
              }
          });
          return (getSport.length === 0 ? true : false);
      } catch (error) {
          console.log(error);
          throw new Error('Error in finding sport');
      }
  }
  static getSportByUserId(userId) {
    return this.findAll({
      where: {
        userId
      },
    });
  }
  }
  sports.init({
    sport_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'sports',
  });
  return sports;
};