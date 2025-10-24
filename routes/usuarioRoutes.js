const express = require('express');
const UsuarioController = require('../controller/usuarioController');

const router = express.Router();
const usuarioController = new UsuarioController();

// Rutas CRUD para usuarios
router.post('/', usuarioController.createUsuario.bind(usuarioController));
router.get('/', usuarioController.getAllUsuarios.bind(usuarioController));
router.get('/stats', usuarioController.getStats.bind(usuarioController));
router.get('/:id', usuarioController.getUsuarioById.bind(usuarioController));
router.put('/:id', usuarioController.updateUsuario.bind(usuarioController));
router.delete('/:id', usuarioController.deleteUsuario.bind(usuarioController));
router.delete('/:id/permanent', usuarioController.destroyUsuario.bind(usuarioController));
router.patch('/:id/toggle-status', usuarioController.toggleUsuarioStatus.bind(usuarioController));

// Ruta de autenticación
router.post('/authenticate', usuarioController.authenticateUsuario.bind(usuarioController));

module.exports = router;
