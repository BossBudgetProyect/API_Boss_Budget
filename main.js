const express = require('express');
const cors = require('cors');
const path = require('path');
const databaseManager = require('./config/database');

// Importar rutas
const usuarioRoutes = require('./routes/usuarioRoutes');

class App {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    initializeMiddlewares() {
        // CORS
        this.app.use(cors());
        
        // Body parsing middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        
        // Static files
        this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
        
        // Logging middleware
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    async initializeDatabase() {
        try {
            console.log("📊 Verificando y creando tablas de base de datos si es necesario...");
            
            // Esperar a que la base de datos esté completamente inicializada
            let attempts = 0;
            const maxAttempts = 20;
            
            while (attempts < maxAttempts) {
                try {
                    const connection = databaseManager.getConnection();
                    console.log("✅ Tablas listas.");
                    console.log(`📁 Base de datos usada: ${connection.config.dialect}`);
                    return; // Salir si todo está bien
                } catch (error) {
                    attempts++;
                    console.log(`⏳ Esperando inicialización de base de datos... intento ${attempts}/${maxAttempts}`);
                    
                    if (attempts >= maxAttempts) {
                        throw new Error('Timeout esperando inicialización de base de datos');
                    }
                    
                    // Esperar 1 segundo antes del siguiente intento
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
        } catch (error) {
            console.error('❌ Error inicializando base de datos:', error);
            process.exit(1);
        }
    }

    initializeRoutes() {
        // Rutas principales
        this.app.use('/api/usuarios', usuarioRoutes);
        
        // Ruta de salud
        this.app.get('/health', async (req, res) => {
            try {
                const health = await databaseManager.healthCheck();
                res.json({
                    status: 'success',
                    message: 'API funcionando correctamente',
                    database: health
                });
            } catch (error) {
                res.status(503).json({
                    status: 'error',
                    message: 'Problemas con la base de datos',
                    error: error.message
                });
            }
        });
        
        // Ruta raíz
        this.app.get('/', (req, res) => {
            res.json({
                message: 'Bienvenido a la API de Gestión Financiera',
                version: '1.0.0',
                endpoints: {
                    usuarios: '/api/usuarios',
                    health: '/health'
                }
            });
        });
        
        console.log("✅ Rutas registradas correctamente");
    }

    initializeErrorHandling() {
        // Manejo de errores 404
        this.app.use('*', (req, res) => {
            res.status(404).json({
                status: 'error',
                message: `Ruta no encontrada: ${req.originalUrl}`
            });
        });

        // Manejo global de errores
        this.app.use((error, req, res, next) => {
            console.error('🔥 Error no manejado:', error);
            
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error interno del servidor',
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            });
        });
    }

    start() {
        this.server = this.app.listen(this.port, () => {
            console.log(`🚀 Servidor ejecutándose en el puerto ${this.port}`);
            console.log(`📚 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 URL: http://localhost:${this.port}`);
        });

        // Manejo graceful de cierre
        process.on('SIGTERM', this.shutdown.bind(this));
        process.on('SIGINT', this.shutdown.bind(this));
    }

    async shutdown() {
        console.log('🔻 Recibida señal de apagado, cerrando servidor...');
        
        try {
            await databaseManager.close();
            this.server.close(() => {
                console.log('✅ Servidor cerrado correctamente');
                process.exit(0);
            });
        } catch (error) {
            console.error('❌ Error cerrando servidor:', error);
            process.exit(1);
        }
    }
}

// Crear e iniciar la aplicación
async function startApp() {
    const application = new App();
    await application.initializeDatabase();
    application.start();
}

startApp().catch(error => {
    console.error('❌ Error iniciando la aplicación:', error);
    process.exit(1);
});

module.exports = App;