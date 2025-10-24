const UsuarioRepository = require('../repositories/usuarioRepository');
const bcrypt = require('bcryptjs');

class UsuarioService {
    constructor() {
        this.usuarioRepository = new UsuarioRepository();
    }

    // Validaciones
    validateUsuarioData(usuarioData, isUpdate = false) {
        const errors = [];

        if (!isUpdate || usuarioData.nombre !== undefined) {
            if (!usuarioData.nombre || usuarioData.nombre.trim().length < 2) {
                errors.push('El nombre debe tener al menos 2 caracteres');
            }
        }

        if (!isUpdate || usuarioData.email !== undefined) {
            if (!usuarioData.email || !this.isValidEmail(usuarioData.email)) {
                errors.push('El email debe ser válido');
            }
        }

        if (!isUpdate || usuarioData.password !== undefined) {
            if (!usuarioData.password || usuarioData.password.length < 6) {
                errors.push('La contraseña debe tener al menos 6 caracteres');
            }
        }

        if (usuarioData.telefono && usuarioData.telefono.length > 20) {
            errors.push('El teléfono no puede tener más de 20 caracteres');
        }

        if (usuarioData.rol && !['admin', 'usuario', 'moderador'].includes(usuarioData.rol)) {
            errors.push('El rol debe ser: admin, usuario o moderador');
        }

        if (usuarioData.fecha_nacimiento && !this.isValidDate(usuarioData.fecha_nacimiento)) {
            errors.push('La fecha de nacimiento debe ser válida');
        }

        return errors;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    // Hash de contraseña
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    // Verificar contraseña
    async verifyPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    // Crear usuario
    async createUsuario(usuarioData) {
        try {
            // Validar datos
            const validationErrors = this.validateUsuarioData(usuarioData);
            if (validationErrors.length > 0) {
                throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
            }

            // Verificar si el email ya existe
            const emailExists = await this.usuarioRepository.emailExists(usuarioData.email);
            if (emailExists) {
                throw new Error('Ya existe un usuario con este email');
            }

            // Hash de la contraseña
            const hashedPassword = await this.hashPassword(usuarioData.password);

            // Preparar datos para crear
            const newUsuarioData = {
                ...usuarioData,
                password: hashedPassword,
                fecha_registro: new Date(),
                activo: true
            };

            const usuario = await this.usuarioRepository.create(newUsuarioData);
            return usuario;
        } catch (error) {
            console.error('Error en createUsuario:', error);
            throw error;
        }
    }

    // Obtener todos los usuarios
    async getAllUsuarios(options = {}) {
        try {
            const { page = 1, limit = 10, search = '', rol = '', activo = '' } = options;
            
            const whereClause = {};
            
            // Búsqueda temporalmente deshabilitada para evitar errores
            // if (search) {
            //     whereClause.nombre = { $like: `%${search}%` };
            // }

            if (rol) {
                whereClause.rol = rol;
            }

            if (activo !== '') {
                whereClause.activo = activo === 'true';
            }

            const offset = (parseInt(page) - 1) * parseInt(limit);
            
            return await this.usuarioRepository.findAll({
                limit: parseInt(limit),
                offset,
                where: whereClause
            });
        } catch (error) {
            console.error('Error en getAllUsuarios:', error);
            throw error;
        }
    }

    // Obtener usuario por ID
    async getUsuarioById(id) {
        try {
            if (!id || isNaN(id)) {
                throw new Error('ID de usuario inválido');
            }

            const usuario = await this.usuarioRepository.findById(id);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }

            return usuario;
        } catch (error) {
            console.error('Error en getUsuarioById:', error);
            throw error;
        }
    }

    // Obtener usuario por email
    async getUsuarioByEmail(email) {
        try {
            if (!email || !this.isValidEmail(email)) {
                throw new Error('Email inválido');
            }

            const usuario = await this.usuarioRepository.findByEmail(email);
            return usuario;
        } catch (error) {
            console.error('Error en getUsuarioByEmail:', error);
            throw error;
        }
    }

    // Actualizar usuario
    async updateUsuario(id, updateData) {
        try {
            if (!id || isNaN(id)) {
                throw new Error('ID de usuario inválido');
            }

            // Verificar que el usuario existe
            const existingUsuario = await this.usuarioRepository.findById(id);
            if (!existingUsuario) {
                throw new Error('Usuario no encontrado');
            }

            // Validar datos
            const validationErrors = this.validateUsuarioData(updateData, true);
            if (validationErrors.length > 0) {
                throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
            }

            // Verificar email único si se está actualizando
            if (updateData.email) {
                const emailExists = await this.usuarioRepository.emailExists(updateData.email, id);
                if (emailExists) {
                    throw new Error('Ya existe un usuario con este email');
                }
            }

            // Hash de contraseña si se está actualizando
            if (updateData.password) {
                updateData.password = await this.hashPassword(updateData.password);
            }

            const usuarioActualizado = await this.usuarioRepository.update(id, updateData);
            return usuarioActualizado;
        } catch (error) {
            console.error('Error en updateUsuario:', error);
            throw error;
        }
    }

    // Eliminar usuario (soft delete)
    async deleteUsuario(id) {
        try {
            if (!id || isNaN(id)) {
                throw new Error('ID de usuario inválido');
            }

            // Verificar que el usuario existe
            const existingUsuario = await this.usuarioRepository.findById(id);
            if (!existingUsuario) {
                throw new Error('Usuario no encontrado');
            }

            const deleted = await this.usuarioRepository.delete(id);
            if (!deleted) {
                throw new Error('No se pudo eliminar el usuario');
            }

            return { message: 'Usuario eliminado correctamente' };
        } catch (error) {
            console.error('Error en deleteUsuario:', error);
            throw error;
        }
    }

    // Eliminar usuario permanentemente
    async destroyUsuario(id) {
        try {
            if (!id || isNaN(id)) {
                throw new Error('ID de usuario inválido');
            }

            const destroyed = await this.usuarioRepository.destroy(id);
            if (!destroyed) {
                throw new Error('No se pudo eliminar el usuario permanentemente');
            }

            return { message: 'Usuario eliminado permanentemente' };
        } catch (error) {
            console.error('Error en destroyUsuario:', error);
            throw error;
        }
    }

    // Activar/Desactivar usuario
    async toggleUsuarioStatus(id) {
        try {
            if (!id || isNaN(id)) {
                throw new Error('ID de usuario inválido');
            }

            const usuario = await this.usuarioRepository.findById(id);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }

            const newStatus = !usuario.activo;
            const usuarioActualizado = await this.usuarioRepository.update(id, { activo: newStatus });
            
            return {
                message: `Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`,
                usuario: usuarioActualizado
            };
        } catch (error) {
            console.error('Error en toggleUsuarioStatus:', error);
            throw error;
        }
    }

    // Obtener estadísticas
    async getStats() {
        try {
            return await this.usuarioRepository.getStats();
        } catch (error) {
            console.error('Error en getStats:', error);
            throw error;
        }
    }

    // Autenticar usuario
    async authenticateUsuario(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email y contraseña son requeridos');
            }

            const usuario = await this.usuarioRepository.findByEmail(email);
            if (!usuario) {
                throw new Error('Credenciales inválidas');
            }

            if (!usuario.activo) {
                throw new Error('Usuario inactivo');
            }

            const isValidPassword = await this.verifyPassword(password, usuario.password);
            if (!isValidPassword) {
                throw new Error('Credenciales inválidas');
            }

            // Actualizar última actividad
            await this.usuarioRepository.updateLastActivity(usuario.id);

            return usuario;
        } catch (error) {
            console.error('Error en authenticateUsuario:', error);
            throw error;
        }
    }
}

module.exports = UsuarioService;
