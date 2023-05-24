'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sportname: {
        type: Sequelize.STRING
      },
      time: {
        type: Sequelize.DATE
      },
      playername: {
        type: Sequelize.ARRAY
      },
      numplayers: {
        type: Sequelize.INTEGER
      },
      place: {
        type: Sequelize.STRING
      },
      created: {
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
    await queryInterface.dropTable('sessions');
  }
};