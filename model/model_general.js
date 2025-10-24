const { DataTypes } = require('sequelize');

// Función para inicializar todos los modelos
const initModels = (sequelize) => {
    // Modelo Usuario
    const Usuario = sequelize.define('Usuario', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [6, 255]
            }
        },
        telefono: {
            type: DataTypes.STRING(20),
            allowNull: true,
            validate: {
                len: [0, 20]
            }
        },
        fecha_nacimiento: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        rol: {
            type: DataTypes.ENUM('admin', 'usuario', 'moderador'),
            defaultValue: 'usuario',
            allowNull: false
        },
        fecha_registro: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        ultima_actividad: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'usuarios',
        timestamps: false, // Usamos nuestros propios campos de fecha
        indexes: [
            {
                unique: true,
                fields: ['email']
            },
            {
                fields: ['activo']
            },
            {
                fields: ['rol']
            }
        ]
    });

    // Métodos de instancia
    Usuario.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());
        delete values.password; // No exponer la contraseña
        return values;
    };

    Usuario.prototype.isActive = function() {
        return this.activo === true;
    };

    Usuario.prototype.updateLastActivity = function() {
        this.ultima_actividad = new Date();
        return this.save();
    };

    // Métodos estáticos
    Usuario.findByEmail = function(email) {
        return this.findOne({ where: { email } });
    };

    Usuario.findActiveUsers = function() {
        return this.findAll({ where: { activo: true } });
    };

    Usuario.findByRole = function(rol) {
        return this.findAll({ where: { rol } });
    };

    return {
        Usuario
    };
};

module.exports = initModels;