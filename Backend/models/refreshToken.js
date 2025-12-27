const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const RefreshToken = sequelize.define(
    "RefreshToken",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "refresh_tokens",
      timestamps: true,
      updatedAt: false,
      paranoid: false,
      indexes: [{ fields: ["user_id"] }, { fields: ["token"] }, { fields: ["expires_at"] }],
    },
  )

  return RefreshToken
}
