const { DataTypes } = require("sequelize")
const bcrypt = require("bcryptjs")

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [8, 255],
        },
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      last_login: {
        type: DataTypes.DATE,
      },
      password_reset_token: {
        type: DataTypes.STRING(255),
      },
      password_reset_expires: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "users",
      indexes: [{ fields: ["email"] }, { fields: ["role_id"] }, { fields: ["is_active"] }, { fields: ["deleted_at"] }],
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10)
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 10)
          }
        },
      },
    },
  )

  // Instance methods
  User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
  }

  User.prototype.toJSON = function () {
    const values = { ...this.get() }
    delete values.password
    delete values.password_reset_token
    delete values.password_reset_expires
    return values
  }

  return User
}
