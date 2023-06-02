'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('session', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sportname: {
        type: Sequelize.INTEGER
      },
      time: {
        type: Sequelize.DATE
      },
      playername: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      numofplayers: {
        type: Sequelize.INTEGER
      },
      venue: {
        type: Sequelize.STRING
      },
      sessioncreated: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('session');
  }
};