const { Sequelize } = require('sequelize');
const path = require('path');
const initModels = require('../model/model_general');

class DatabaseManager {
    constructor() {
        this.sequelize = null;
        this.models = null;
        this.isConnected = false;
        this.init();
    }

    async init() {
        // Configuración de MySQL
        const mysqlConfig = {
            database: 'boss_budget_db',
            username: 'root',
            password: '',
            host: 'localhost',
            port: 3306,
            dialect: 'mysql',
            logging: false, // Cambiar a console.log para debug
            retry: {
                max: 2,
                timeout: 3000
            }
        };

        try {
            console.log('Intentando conectar a MySQL...');
            
            this.sequelize = new Sequelize(
                mysqlConfig.database,
                mysqlConfig.username,
                mysqlConfig.password,
                {
                    host: mysqlConfig.host,
                    port: mysqlConfig.port,
                    dialect: mysqlConfig.dialect,
                    logging: mysqlConfig.logging,
                    retry: mysqlConfig.retry,
                    pool: {
                        max: 5,
                        min: 0,
                        acquire: 30000,
                        idle: 10000
                    }
                }
            );

            // Probar conexión a MySQL
            await this.sequelize.authenticate();
            console.log('✅ Conexión a MySQL exitosa.');
            this.isConnected = true;
            
        } catch (mysqlError) {
            console.warn('❌ No se pudo conectar a MySQL. Usando SQLite local:', mysqlError.message);
            await this.setupSQLite();
        }

        await this.setupModels();
    }

    async setupSQLite() {
        try {
            const sqlitePath = path.join(process.cwd(), 'products_local.db');
            console.log(`📁 Usando base de datos SQLite: ${sqlitePath}`);
            
            this.sequelize = new Sequelize({
                dialect: 'sqlite',
                storage: sqlitePath,
                logging: console.log,
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                }
            });

            // Probar conexión a SQLite
            await this.sequelize.authenticate();
            console.log('✅ Conexión a SQLite exitosa.');
            this.isConnected = true;
            
        } catch (sqliteError) {
            console.error('❌ Error conectando a SQLite:', sqliteError);
            throw sqliteError;
        }
    }

    async setupModels() {
        try {
            console.log('📦 Cargando modelos...');
            
            // Inicializar modelos
            this.models = initModels(this.sequelize);
            
            // Sincronizar modelos con la base de datos
            await this.sequelize.sync({ 
                force: false, // ¡CUIDADO: true borra todos los datos!
                alter: true   // Actualiza el esquema sin borrar datos
            });
            
            console.log('✅ Modelos sincronizados correctamente');
            
        } catch (error) {
            console.error('❌ Error configurando modelos:', error);
            throw error;
        }
    }

    getConnection() {
        if (!this.isConnected) {
            throw new Error('La base de datos no está conectada');
        }
        return this.sequelize;
    }

    getModels() {
        if (!this.models) {
            throw new Error('Los modelos no han sido inicializados');
        }
        return this.models;
    }

    getTransaction() {
        return this.sequelize.transaction();
    }

    async close() {
        if (this.sequelize) {
            await this.sequelize.close();
            this.isConnected = false;
            console.log('🔌 Conexión a la base de datos cerrada');
        }
    }

    async healthCheck() {
        try {
            await this.sequelize.authenticate();
            return {
                status: 'healthy',
                database: this.sequelize.getDialect(),
                connected: true
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                connected: false
            };
        }
    }

}

// Patrón Singleton para una única instancia
const databaseManager = new DatabaseManager();

module.exports = databaseManager;