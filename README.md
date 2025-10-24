# Boss Budget API - Sistema CRUD de Usuarios

Este proyecto implementa un sistema completo de CRUD para usuarios usando Node.js, Express, Sequelize y MySQL/SQLite.

## 🚀 Características

- **CRUD completo** para usuarios
- **Autenticación** con hash de contraseñas
- **Validaciones** de datos
- **Paginación** en listados
- **Filtros** por rol, estado, búsqueda
- **Soft delete** y eliminación permanente
- **Estadísticas** de usuarios
- **Arquitectura en capas**: Controller → Service → Repository → Model
- **Base de datos flexible**: MySQL (producción) o SQLite (desarrollo)

## 📁 Estructura del Proyecto

```
API_Boss_Budget/
├── config/
│   └── database.js          # Configuración de base de datos
├── controller/
│   └── usuarioController.js # Controladores de usuarios
├── model/
│   └── model_general.js     # Modelos de Sequelize
├── repositories/
│   └── usuarioRepository.js # Acceso a datos
├── routes/
│   └── usuarioRoutes.js     # Rutas de la API
├── services/
│   └── usuarioService.js     # Lógica de negocio
├── main.js                  # Punto de entrada
├── package.json             # Dependencias
└── requests.http            # Pruebas de la API
```

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar base de datos:**
   - **MySQL**: Editar `config/database.js` con tus credenciales
   - **SQLite**: Se creará automáticamente si MySQL no está disponible

3. **Ejecutar el servidor:**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 Endpoints de la API

### Base URL: `http://localhost:3000`

#### Usuarios
- `POST /api/usuarios` - Crear usuario
- `GET /api/usuarios` - Listar usuarios (con paginación y filtros)
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario (soft delete)
- `DELETE /api/usuarios/:id/permanent` - Eliminar permanentemente
- `PATCH /api/usuarios/:id/toggle-status` - Activar/Desactivar usuario
- `GET /api/usuarios/stats` - Estadísticas de usuarios

#### Autenticación
- `POST /api/usuarios/authenticate` - Autenticar usuario

#### Sistema
- `GET /health` - Estado de la API
- `GET /` - Información de la API

## 🧪 Pruebas

Usa el archivo `requests.http` para probar todos los endpoints. Incluye:

- ✅ Casos de éxito
- ❌ Casos de error
- 🔐 Autenticación
- 📊 Estadísticas

## 📋 Modelo de Usuario

```javascript
{
  id: Integer (auto-increment)
  nombre: String (2-100 caracteres)
  email: String (único, formato email)
  password: String (hash bcrypt)
  telefono: String (opcional, max 20 caracteres)
  fecha_nacimiento: Date (opcional)
  activo: Boolean (default: true)
  rol: Enum ['admin', 'usuario', 'moderador'] (default: 'usuario')
  fecha_registro: Date (auto)
  ultima_actividad: Date (opcional)
}
```

## 🔧 Configuración

### Variables de Entorno
```bash
PORT=3000
NODE_ENV=development
```

### Base de Datos
- **MySQL**: Configurar en `config/database.js`
- **SQLite**: Se crea automáticamente como `products_local.db`

## 🚦 Estados de Respuesta

- `200` - Éxito
- `201` - Creado
- `400` - Datos inválidos
- `401` - No autorizado
- `404` - No encontrado
- `409` - Conflicto (email duplicado)
- `500` - Error interno

## 📝 Ejemplo de Uso

### Crear Usuario
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "rol": "usuario"
  }'
```

### Listar Usuarios
```bash
curl http://localhost:3000/api/usuarios?page=1&limit=10
```

### Autenticar Usuario
```bash
curl -X POST http://localhost:3000/api/usuarios/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Validación de datos de entrada
- Soft delete para preservar datos
- Manejo de errores sin exposición de información sensible

## 📈 Próximas Mejoras

- [ ] Middleware de autenticación JWT
- [ ] Rate limiting
- [ ] Logging avanzado
- [ ] Tests unitarios
- [ ] Documentación con Swagger
- [ ] Dockerización

---

**Desarrollado para Boss Budget** 🏦