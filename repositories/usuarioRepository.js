const databaseManager = require('../config/database');

class UsuarioRepository {
    constructor() {
        this.Usuario = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            // Esperar a que la base de datos esté lista
            let attempts = 0;
            const maxAttempts = 10;
            
            while (attempts < maxAttempts) {
                try {
                    const models = databaseManager.getModels();
                    this.Usuario = models.Usuario;
                    this.initialized = true;
                    break;
                } catch (error) {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        throw error;
                    }
                    // Esperar 500ms antes del siguiente intento
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        } catch (error) {
            console.error('Error inicializando UsuarioRepository:', error);
            throw error;
        }
    }

    async ensureInitialized() {
        if (!this.initialized) {
            await this.init();
        }
    }

    // Crear un nuevo usuario
    async create(usuarioData) {
        try {
            await this.ensureInitialized();
            const usuario = await this.Usuario.create(usuarioData);
            return usuario;
        } catch (error) {
            console.error('Error creando usuario:', error);
            throw error;
        }
    }

    // Obtener todos los usuarios
    async findAll(options = {}) {
        try {
            await this.ensureInitialized();
            const { limit = 10, offset = 0, where = {} } = options;
            
            const usuarios = await this.Usuario.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['fecha_registro', 'DESC']]
            });

            return {
                data: usuarios.rows,
                total: usuarios.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            };
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            throw error;
        }
    }

    // Obtener usuario por ID
    async findById(id) {
        try {
            await this.ensureInitialized();
            const usuario = await this.Usuario.findByPk(id);
            return usuario;
        } catch (error) {
            console.error('Error obteniendo usuario por ID:', error);
            throw error;
        }
    }

    // Obtener usuario por email
    async findByEmail(email) {
        try {
            await this.ensureInitialized();
            const usuario = await this.Usuario.findOne({ where: { email } });
            return usuario;
        } catch (error) {
            console.error('Error obteniendo usuario por email:', error);
            throw error;
        }
    }

    // Actualizar usuario
    async update(id, updateData) {
        try {
            await this.ensureInitialized();
            const [affectedRows] = await this.Usuario.update(updateData, {
                where: { id }
            });

            if (affectedRows === 0) {
                return null;
            }

            const usuarioActualizado = await this.findById(id);
            return usuarioActualizado;
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            throw error;
        }
    }

    // Eliminar usuario (soft delete)
    async delete(id) {
        try {
            await this.ensureInitialized();
            const [affectedRows] = await this.Usuario.update(
                { activo: false },
                { where: { id } }
            );

            return affectedRows > 0;
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            throw error;
        }
    }

    // Eliminar usuario permanentemente
    async destroy(id) {
        try {
            await this.ensureInitialized();
            const affectedRows = await this.Usuario.destroy({
                where: { id }
            });

            return affectedRows > 0;
        } catch (error) {
            console.error('Error eliminando usuario permanentemente:', error);
            throw error;
        }
    }

    // Buscar usuarios activos
    async findActiveUsers(options = {}) {
        try {
            await this.ensureInitialized();
            return await this.findAll({
                ...options,
                where: { ...options.where, activo: true }
            });
        } catch (error) {
            console.error('Error obteniendo usuarios activos:', error);
            throw error;
        }
    }

    // Buscar usuarios por rol
    async findByRole(rol, options = {}) {
        try {
            await this.ensureInitialized();
            return await this.findAll({
                ...options,
                where: { ...options.where, rol }
            });
        } catch (error) {
            console.error('Error obteniendo usuarios por rol:', error);
            throw error;
        }
    }

    // Verificar si existe un usuario con el email
    async emailExists(email, excludeId = null) {
        try {
            await this.ensureInitialized();
            const whereClause = { email };
            if (excludeId) {
                whereClause.id = { [databaseManager.getConnection().Op.ne]: excludeId };
            }

            const count = await this.Usuario.count({ where: whereClause });
            return count > 0;
        } catch (error) {
            console.error('Error verificando existencia de email:', error);
            throw error;
        }
    }

    // Actualizar última actividad
    async updateLastActivity(id) {
        try {
            await this.ensureInitialized();
            const [affectedRows] = await this.Usuario.update(
                { ultima_actividad: new Date() },
                { where: { id } }
            );

            return affectedRows > 0;
        } catch (error) {
            console.error('Error actualizando última actividad:', error);
            throw error;
        }
    }

    // Obtener estadísticas de usuarios
    async getStats() {
        try {
            await this.ensureInitialized();
            const total = await this.Usuario.count();
            const activos = await this.Usuario.count({ where: { activo: true } });
            const inactivos = await this.Usuario.count({ where: { activo: false } });
            
            const porRol = await this.Usuario.findAll({
                attributes: [
                    'rol',
                    [databaseManager.getConnection().fn('COUNT', databaseManager.getConnection().col('id')), 'count']
                ],
                group: ['rol'],
                raw: true
            });

            return {
                total,
                activos,
                inactivos,
                porRol: porRol.reduce((acc, item) => {
                    acc[item.rol] = parseInt(item.count);
                    return acc;
                }, {})
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }
}

module.exports = UsuarioRepository;
