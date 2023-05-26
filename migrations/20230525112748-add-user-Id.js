'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("sessions", "userId", {
      type: Sequelize.DataTypes.INTEGER,
    });

    await queryInterface.addConstraint("sessions", {
      fields: ["userId"],
      type: "foreign key",
      references: {
        table: "user",
        field: "id",
      },
    });

    await queryInterface.addColumn("sports", "userId", {
      type: Sequelize.DataTypes.INTEGER,
    });

    await queryInterface.addConstraint("sports", {
      fields: ["userId"],
      type: "foreign key",
      references: {
        table: "user",
        field: "id",
      },
    });
  },
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

  async down (queryInterface) {
    await queryInterface.removeColumn("sessions", "userId");
    await queryInterface.removeColumn("sports", "userId");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
