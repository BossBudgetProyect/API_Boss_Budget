const UsuarioService = require('../services/usuarioService');

class UsuarioController {
    constructor() {
        this.usuarioService = new UsuarioService();
    }

    // Crear usuario
    async createUsuario(req, res) {
        try {
            const usuarioData = req.body;
            const usuario = await this.usuarioService.createUsuario(usuarioData);
            
            res.status(201).json({
                status: 'success',
                message: 'Usuario creado correctamente',
                data: usuario
            });
        } catch (error) {
            console.error('Error en createUsuario controller:', error);
            
            if (error.message.includes('Ya existe un usuario con este email')) {
                return res.status(409).json({
                    status: 'error',
                    message: error.message
                });
            }
            
            if (error.message.includes('Datos inválidos')) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Obtener todos los usuarios
    async getAllUsuarios(req, res) {
        try {
            const options = {
                page: req.query.page || 1,
                limit: req.query.limit || 10,
                search: req.query.search || '',
                rol: req.query.rol || '',
                activo: req.query.activo || ''
            };

            const result = await this.usuarioService.getAllUsuarios(options);
            
            res.status(200).json({
                status: 'success',
                message: 'Usuarios obtenidos correctamente',
                data: result.data,
                pagination: {
                    total: result.total,
                    page: parseInt(options.page),
                    limit: parseInt(options.limit),
                    totalPages: Math.ceil(result.total / parseInt(options.limit))
                }
            });
        } catch (error) {
            console.error('Error en getAllUsuarios controller:', error);
            
            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Obtener usuario por ID
    async getUsuarioById(req, res) {
        try {
            const { id } = req.params;
            const usuario = await this.usuarioService.getUsuarioById(id);
            
            res.status(200).json({
                status: 'success',
                message: 'Usuario obtenido correctamente',
                data: usuario
            });
        } catch (error) {
            console.error('Error en getUsuarioById controller:', error);
            
            if (error.message.includes('ID de usuario inválido')) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            }
            
            if (error.message.includes('Usuario no encontrado')) {
                return res.status(404).json({
                    status: 'error',
                    message: error.message
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Actualizar usuario
    async updateUsuario(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const usuario = await this.usuarioService.updateUsuario(id, updateData);
            
            res.status(200).json({
                status: 'success',
                message: 'Usuario actualizado correctamente',
                data: usuario
            });
        } catch (error) {
            console.error('Error en updateUsuario controller:', error);
            
            if (error.message.includes('ID de usuario inválido')) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            }
            
            if (error.message.includes('Usuario no encontrado')) {
                return res.status(404).json({
                    status: 'error',
                    message: error.message
                });
            }
            
            if (error.message.includes('Ya existe un usuario con este email')) {
                return res.status(409).json({
                    status: 'error',
                    message: error.message
                });
            }
            
            if (error.message.includes('Datos inválidos')) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Eliminar usuario (soft delete)
    async deleteUsuario(req, res) {
        try {
            const { id } = req.params;
            const result = await this.usuarioService.deleteUsuario(id);
            
            res.status(200).json({
                status: 'success',
                message: result.message
            });
        } catch (error) {
            console.error('Error en deleteUsuario controller:', error);
            
            if (error.message.includes('ID de usuario inválido')) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            }
            
            if (error.message.includes('Usuario no encontrado')) {
                return res.status(404).json({
                    status: 'error',
                    message: error.message
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Eliminar usuario permanentemente
    async destroyUsuario(req, res) {
        try {
            const { id } = req.params;
            const result = await this.usuarioService.destroyUsuario(id);
            
            res.status(200).json({
                status: 'success',
                message: result.message
            });
        } catch (error) {
            console.error('Error en destroyUsuario controller:', error);
            
            if (error.message.includes('ID de usuario inválido')) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Activar/Desactivar usuario
    async toggleUsuarioStatus(req, res) {
        try {
            const { id } = req.params;
            const result = await this.usuarioService.toggleUsuarioStatus(id);
            
            res.status(200).json({
                status: 'success',
                message: result.message,
                data: result.usuario
            });
        } catch (error) {
            console.error('Error en toggleUsuarioStatus controller:', error);
            
            if (error.message.includes('ID de usuario inválido')) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            }
            
            if (error.message.includes('Usuario no encontrado')) {
                return res.status(404).json({
                    status: 'error',
                    message: error.message
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Obtener estadísticas
    async getStats(req, res) {
        try {
            const stats = await this.usuarioService.getStats();
            
            res.status(200).json({
                status: 'success',
                message: 'Estadísticas obtenidas correctamente',
                data: stats
            });
        } catch (error) {
            console.error('Error en getStats controller:', error);
            
            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Autenticar usuario
    async authenticateUsuario(req, res) {
        try {
            const { email, password } = req.body;
            const usuario = await this.usuarioService.authenticateUsuario(email, password);
            
            res.status(200).json({
                status: 'success',
                message: 'Autenticación exitosa',
                data: usuario
            });
        } catch (error) {
            console.error('Error en authenticateUsuario controller:', error);
            
            if (error.message.includes('Email y contraseña son requeridos') || 
                error.message.includes('Email inválido') ||
                error.message.includes('Credenciales inválidas') ||
                error.message.includes('Usuario inactivo')) {
                return res.status(401).json({
                    status: 'error',
                    message: error.message
                });
            }

            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = UsuarioController;
