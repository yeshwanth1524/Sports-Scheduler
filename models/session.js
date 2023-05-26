'use strict';
const {Model,Op} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      session.belongsTo(models.user,{
        foreignKey: 'userId'  
      })
      // define association here
    }
    static addSession({sportname, dateTime, place, players, numplayers, created, userId}){
      return this.create({
        sportname: sportname,
        time: dateTime,
        userId: userId,
        place: place,
        playername: players,
        numplayers: numplayers,
        created: created
      })
    }

    static async addPlayer(sessionId, player) {
      try {
          // Find the session by ID
          const session = await this.findByPk(sessionId);
  
          // Get the current player names
          let playerNames = session.playername;
  
          // Add the new player to the player names array
          playerNames.push(player);
  
          // Update the session with the new player names
          return this.update({
              playername: playerNames
          }, {
              where: {
                  id: sessionId
              }
          });
      } catch (error) {
          console.log(error);

          throw new Error("Failed to add player");
      }
  }
  static deleteSession(sportname, userId) {
    return this.destroy({
      where: {
        sportname,
        userId
      },
    });
  }

    static getSessions({sportname,userId}){
      const currentDate = new Date();
      return this.findAll({
        where: {
          sportname: sportname,
          created: true,
          userId,
          time: {
            [Op.gt]: currentDate,
        }
        }
      })
    }

    static getAllSessions({ sportname }) {
      const currentDate = new Date();
      return this.findAll({
          where: {
              sportname: sportname,
              time: {
                  [Op.gt]: currentDate,
              }
          }
      });
  }

  static async getPreviousSessions(sportname) {
    const currentDate = new Date();
  
    return this.findAll({
      where: {
        sportname: sportname,
        sessioncreated: false,
        time: {
          [Op.lt]: currentDate,
        },
      },
    });
  }  

  static getPlayedSessions(userId) {
    const currentDate = new Date();
  
    return this.findAll({
      where: {
        userId: userId,
        sessioncreated: true,
        dateTime: {
          [Op.lt]: currentDate,
        },
      },
    });
  }
  
  static async cancelSession(id) {
      try {
          // Update the session with sessioncreated set to false
          return this.update({
              sessioncreated: false
          }, {
              where: {
                  userId: id
              }
          });
      } catch (error) {
          console.log(error);

          throw new Error("Failed to cancel session");
      }
  }
  
  static getSessionById(id) {
      return this.findByPk(id);
  }
  
  static async removePlayer(playername, id) {
    try {
        const session = await this.findByPk(id);
        const playerIndex = session.playername.indexOf(playername);
        session.playername.splice(playerIndex, 1);

        // Update the session with the updated player names
        return this.update({
            playername: session.playername
        }, {
            where: {
                id
            }
        });
    } catch (error) {
        console.log(error);
        throw new Error("Failed to remove player");
    }
  }

  }
  session.init({
    sportname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    playername: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false
    },
    numplayers: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    place: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
   }, {
    sequelize,
    modelName: 'session',
  });
  return session;
};