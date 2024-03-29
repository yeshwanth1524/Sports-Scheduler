'use strict';
const { Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class sports extends Model {
    static associate(models) {
      sports.belongsTo(models.user, {
        foreignKey: 'userId'
      });
      sports.hasMany(models.session, {
        foreignKey: 'sportId'
      });
    }

    static createsports({ sport, userId }) {
      return this.create({
        sport_name: sport,
        userId: userId,
      });
    }

    static async deleteSport(id) {
      try {
        const rowDeleted = await this.destroy({
          where: {
            id: id,
          },
        });
        if (rowDeleted === 1) {
          console.log("Deleted successfully");
        }
      } catch (err) {
        console.log(err);
      }
    }

    static async getSports() {
      try {
        return this.findAll({
          order: [['id', 'ASC']],
        });
      } catch (error) {
        console.error('could not get all sports', error);
      }
    }

    static findSportById(id) {
      return this.findByPk(id);
    }

    static getSportByUserId(userId) {
      return this.findAll({
        where: {
          userId: userId,
        },
      });
    }

    static async findSportByName(sportname, userId) {
      const sport = await this.findOne({
        where: {
          sport_name: sportname,
          userId: userId,
        },
      });
      if (sport != null) {
        return sport.length == 0 ? true : false;
      } else {
        return sport == null ? true : false;
      }
    }

  }    

  sports.init(
    {
      sport_name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'sports',
    }
  );

  return sports;
};
