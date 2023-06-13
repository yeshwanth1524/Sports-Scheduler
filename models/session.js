'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class session extends Model {
    static associate(models) {
      session.belongsTo(models.user, {
        foreignKey: 'userId'
      });
      session.belongsTo(models.sports, { 
        foreignKey: 'sportId'
      });
    }

    static async addPlayer(id, player) {
      const session = await this.findByPk(id);
      const playerNames = session.playername.slice();
      playerNames.push(player);
      return session.update({
        playername: playerNames,
      });
    }

    static addSession({sportname,dateTime,venue,players,numofplayers,sessioncreated,userId,canceledReason,}) {
      return this.create({sportname: sportname,time: dateTime,userId: userId,venue: venue,playername: players,numofplayers: numofplayers,
        sessioncreated: sessioncreated,canceledReason: canceledReason,
      });
    }

    static deleteSession(name, userId) {
      return this.destroy({
        where: {
          sportname: name,
          userId: userId,
        },
      });
    }

    static getSession({ sportname, userId }) {
      return this.findAll({
        where: {
          sportname: sportname,
          sessioncreated: true,
          userId: userId,
          time: {
            [Op.gt]: new Date(),
          },
        },
      });
    }

    static async cancelSession(id, userId, reason) {
      await this.update(
        {
          sessioncreated: false,
          canceledReason: reason,
        },
        {
          where: {
            id: id,
            userId: userId,
          },
        }
      );

      // Return the canceled session
      return this.findOne({
        where: {
          id: id,
          userId: userId,
        },
      });
    }

    static getSessionById(id) {
      return this.findByPk(id);
    }

    static getAllSession({ sportname }) {
      return this.findAll({
        where: {
          sportname: sportname,
          sessioncreated: true,
          time: {
            [Op.gt]: new Date(),
          },
        },
      });
    }

    static async removePlayer(playername, id) {
      const session = await this.findByPk(id);
      const playerNames = session.playername.slice();
      const index = playerNames.indexOf(playername);
      if (index > -1) {
        playerNames.splice(index, 1);
        return session.update({
          playername: playerNames,
        });
      }
      return session;
    }

    static async getAllCanceledSessions() {
      return this.findAll({
        where: {
          sessioncreated: false,
          time: {
            [Op.gt]: new Date(),
          },
        },
      });
    }

    static async getSessionsCount(startDate, endDate) {
      return this.count({
        where: {
          time: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
    }

    static getValidSessions({ sportname, userId, startDate, endDate }) {
      return this.findAll({
        where: {
          sportname: sportname,
          sessioncreated: true,
          userId: userId,
          time: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
    }
    
    static async getSportsSessionsCount(startDate, endDate) {
      const sports = await this.sequelize.models.sports.findAll();
    
      const counts = {};
      for (const sport of sports) {
        const count = await this.count({
          where: {
            sportname: sport.id,
            sessioncreated: true, // Include only created sessions
            time: {
              [Op.between]: [startDate, endDate],
            },
          },
        });
    
        counts[sport.sport_name] = count;
      }
    
      return counts;
    }
        
    
  }

  session.init(
    {
      sportname: DataTypes.INTEGER,
      time: DataTypes.DATE,
      venue: DataTypes.STRING,
      playername: DataTypes.ARRAY(DataTypes.STRING),
      numofplayers: DataTypes.INTEGER,
      sessioncreated: DataTypes.BOOLEAN,
      canceledReason: DataTypes.STRING,
      sportId: DataTypes.INTEGER, 
    },
    {
      sequelize,
      modelName: 'session',
    }
  );

  return session;
};
