# 📋 Sistema de Gestión Personal

Un sistema web para administrar usuarios, teléfonos, redes sociales y perfiles sociales, protegido con **inicio de sesión**.
Construido con **Node.js/Express** (dos microservicios), **MySQL** (dos bases de datos) y **JavaScript vanilla** (frontend).

**Propósito educativo**: Proyecto del programa SENA para enseñar desarrollo web full-stack con arquitectura en capas, microservicios y autenticación.

---

## 📚 Tabla de Contenidos

1. [Inicio Rápido](#inicio-rápido)
2. [Descripción General](#descripción-general)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Requisitos Previos](#requisitos-previos)
5. [Instalación y Configuración](#instalación-y-configuración)
6. [Comandos para Iniciar la Aplicación](#comandos-para-iniciar-la-aplicación)
7. [Detener los Servidores](#detener-los-servidores)
8. [Autenticación](#autenticación)
9. [Estructura del Proyecto](#estructura-del-proyecto)
10. [Pruebas Automatizadas](#pruebas-automatizadas)
11. [Modelo de Datos](#modelo-de-datos)
12. [API REST - Endpoints Disponibles](#api-rest---endpoints-disponibles)
13. [Cómo Usar la Aplicación](#cómo-usar-la-aplicación)
14. [Tecnologías Utilizadas](#tecnologías-utilizadas)
15. [Solución de Problemas](#solución-de-problemas)

---

## Inicio Rápido

Para quien ya hizo la [instalación](#instalación-y-configuración). Se usan tres terminales, todas abiertas en la raíz del proyecto:

```bash
# Terminal 1: autenticación (puerto 3001)
cd BACKEND_SRV_1 && npm start

# Terminal 2: gestión personal (puerto 3000)
cd BACKEND_SRV_2 && npm start

# Terminal 3: frontend (puerto 8000)
cd FRONTEND && python3 -m http.server 8000
```

Abre **http://localhost:8000/login.html** e ingresa con:

| Usuario | Contraseña |
|---------|------------|
| `admin` | `Admin123*` |

---

## Descripción General

### ¿Qué hace esta aplicación?

Después de iniciar sesión, la aplicación permite:

- 👤 **Crear y administrar usuarios** con información personal (nombre, fecha de nacimiento, ciudad)
- ☎️ **Gestionar teléfonos** asociados a cada usuario
- 🌐 **Catalogar redes sociales** disponibles (Facebook, Instagram, Twitter, etc.)
- 📱 **Crear perfiles sociales** para vincular usuarios con redes sociales específicas

> Las **cuentas de acceso** (quién puede entrar a la aplicación) son distintas de los **usuarios** que se administran en la pestaña "Usuarios". No hay relación entre ellos.

### Características Principales

✅ Página de inicio de sesión y botón para cerrar sesión  
✅ Contraseñas guardadas con SHA-256 y sal, nunca en texto plano  
✅ API de gestión protegida con token (JWT)  
✅ Dos microservicios independientes, cada uno con su base de datos  
✅ CRUD completo (Crear, Leer, Actualizar, Eliminar) para todas las entidades  
✅ Interfaz de usuario intuitiva con navegación por pestañas  
✅ Validación de datos y manejo centralizado de errores  
✅ Soporte CORS para comunicación frontend-backend  
✅ Cálculo automático de edad a partir de fecha de nacimiento  
✅ Borrado lógico de usuarios (no se elimina físicamente)

---

## Arquitectura del Sistema

### Diagrama General de la Aplicación

```
┌──────────────────────────────────────────────────────────────────┐
│                          NAVEGADOR WEB                           │
│                                                                  │
│     login.html  ───── sesión iniciada ─────▶  index.html         │
│  (usuario y clave)                         (módulo de gestión)   │
└─────────┬────────────────────────────────────────┬───────────────┘
          │ POST /api/auth/login                   │ /api/...
          │                                        │ Authorization: Bearer <token>
          ▼                                        ▼
┌──────────────────────────┐          ┌──────────────────────────────┐
│      BACKEND_SRV_1       │          │        BACKEND_SRV_2         │
│      Autenticación       │          │       Gestión personal       │
│      puerto 3001         │          │         puerto 3000          │
│   entrega el token JWT   │          │    verifica el token JWT     │
└─────────┬────────────────┘          └──────────────┬───────────────┘
          ▼                                          ▼
┌──────────────────────────┐          ┌──────────────────────────────┐
│  MySQL: authentication   │          │  MySQL: personal_management  │
│  CUENTA                  │          │  USUARIO, TELEFONO,          │
│                          │          │  RED_SOCIAL, PERFIL_SOCIAL   │
└──────────────────────────┘          └──────────────────────────────┘
```

Los dos servicios **no se llaman entre sí**: comparten el secreto `JWT_SECRET`, con el que uno firma el token y el otro lo verifica.

### Capas de cada microservicio

```
Rutas → Middleware de validación → Controladores → Services → Modelos
```

| Capa | Responsabilidad |
|------|-----------------|
| **Rutas** | Definen los endpoints |
| **Middleware** | Verificación del token (solo gestión personal), campos obligatorios y errores |
| **Controladores** | Reciben la petición HTTP y arman la respuesta |
| **Services** | Lógica de negocio y consultas SQL parametrizadas |
| **Modelos** | Clases del dominio que validan sus datos |

### Diagrama de Flujo de Datos (CRUD)

```
┌──────────────────────────────────────────────────────────────────┐
│                    USUARIO EN EL NAVEGADOR                      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ Completa formulario │
                    └─────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
   ┌─────────────┐                         ┌──────────────┐
   │ Crear (POST)│                         │ Editar (PUT) │
   └─────────────┘                         └──────────────┘
        ↓                                           ↓
   POST /api/usuarios                     PUT /api/usuarios/:id
   Authorization: Bearer <token>          Authorization: Bearer <token>
   {"primerNombre": "Juan", ...}          {"primerNombre": "Juan", ...}
        ↓                                           ↓
   ┌──────────────────────────────────────────────────────┐
   │   El middleware verifica el token (si no es válido,  │
   │      responde 401 y el frontend vuelve al login)     │
   └──────────────────────────────────────────────────────┘
        ↓
   ┌──────────────────────────────────────────────────────┐
   │        La ruta valida los campos obligatorios        │
   │          y el controlador llama al service           │
   └──────────────────────────────────────────────────────┘
        ↓
   ┌──────────────────────────────────────────────────────┐
   │         El service crea el objeto del modelo         │
   │      (sus setters validan; la edad se calcula)       │
   └──────────────────────────────────────────────────────┘
        ↓
   ┌──────────────────────────────────────────────────────┐
   │  Ejecuta INSERT/UPDATE usando SQL parametrizado     │
   │          (Previene inyección SQL)                    │
   └──────────────────────────────────────────────────────┘
        ↓
   ┌──────────────────────────────────────────────────────┐
   │  MySQL almacena/actualiza los datos en las tablas   │
   └──────────────────────────────────────────────────────┘
        ↓
   ┌──────────────────────────────────────────────────────┐
   │  Backend responde con JSON + código HTTP (201/200)  │
   │  {"id": 1, "primerNombre": "Juan", ...}             │
   └──────────────────────────────────────────────────────┘
        ↓
   ┌──────────────────────────────────────────────────────┐
   │  Frontend recibe respuesta y actualiza la tabla      │
   │      Muestra notificación de éxito                   │
   └──────────────────────────────────────────────────────┘
```

---

## Requisitos Previos

Antes de empezar, asegúrate de tener instalados:

### Software Requerido

| Software | Versión Mínima | Descripción |
|----------|----------------|-------------|
| **Node.js** | 18 | Runtime de JavaScript para los dos backends y las pruebas |
| **npm** | el que trae Node.js | Gestor de paquetes |
| **MySQL** | 8.0 | Servidor de base de datos y cliente `mysql` |
| **Python 3** o similar | opcional | Para servir el frontend (cualquier servidor estático sirve) |

### Verificar las Instalaciones

```bash
node -v          # v18.0.0 o superior
npm -v
mysql --version  # 8.0 o superior
```

### Datos de Conexión de Ejemplo

```
HOST: localhost
PUERTO: 3306
BASES DE DATOS: personal_management y authentication
USUARIO MySQL: personal_manager
CONTRASEÑA MySQL: person_123456*
```

Son valores de práctica. Si usas otra contraseña, escríbela en el `.env` de **los dos** servicios.

---

## Instalación y Configuración

Todos los comandos se ejecutan desde la raíz del proyecto. La instalación se hace **una sola vez**.

### Paso 1️⃣: Configurar las Bases de Datos

El orden importa: la cuenta `personal_manager` debe existir **antes** de crear la base de autenticación.

#### 1.1 Crear la base de gestión personal

```bash
# Pide la contraseña de root de MySQL
mysql -u root -p < parametrization/db_relational_model/DB_relational_model.sql
```

#### 1.2 Crear el usuario personal_manager (si no existe)

```bash
mysql -u root -p
```

Dentro de la consola de MySQL:

```sql
CREATE USER 'personal_manager'@'localhost' IDENTIFIED BY 'person_123456*';
GRANT ALL PRIVILEGES ON personal_management.* TO 'personal_manager'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 1.3 Crear la base de autenticación

```bash
mysql -u root -p < parametrization/db_relational_model/DB_authentication_model.sql
```

Este script:

- Crea la base `authentication` y la tabla `CUENTA` (`id`, `username`, `password`).
- Le da a `personal_manager` permiso de **solo lectura** sobre esa base.
- Crea la cuenta de prueba `admin` / `Admin123*`.

Se puede ejecutar varias veces sin borrar ni duplicar datos.

#### 1.4 Verificar

```bash
mysql -u personal_manager -p -e "SHOW TABLES FROM personal_management; SELECT id, username FROM authentication.CUENTA;"
```

Deben aparecer las tablas `PERFIL_SOCIAL`, `RED_SOCIAL`, `TELEFONO` y `USUARIO`, y la cuenta `admin`.

---

### Paso 2️⃣: Instalar las Dependencias

```bash
(cd BACKEND_SRV_1 && npm install)
(cd BACKEND_SRV_2 && npm install)
```

---

### Paso 3️⃣: Configurar las Variables de Entorno

Cada servicio lee su propio archivo `.env`. Si aún no existe, cópialo de la plantilla (**si ya existe, no lo sobrescribas**):

```bash
cp -n BACKEND_SRV_1/.env.example BACKEND_SRV_1/.env
cp -n BACKEND_SRV_2/.env.example BACKEND_SRV_2/.env
```

Genera un secreto para firmar los tokens:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Luego completa los dos archivos:

| Variable | `BACKEND_SRV_1/.env` | `BACKEND_SRV_2/.env` |
|----------|----------------------|----------------------|
| `DB_HOST` | `localhost` | `localhost` |
| `DB_PORT` | `3306` | `3306` |
| `DB_NAME` | `authentication` | `personal_management` |
| `DB_USER` | `personal_manager` | `personal_manager` |
| `DB_PASSWORD` | la contraseña de MySQL | la contraseña de MySQL |
| `SERVER_PORT` | `3001` | `3000` |
| `JWT_SECRET` | el secreto generado | **el mismo secreto** |
| `JWT_EXPIRES_IN` | `1h` (admite `30m`, `8h`, etc.) | no se usa |

Sin `JWT_SECRET` los servicios no arrancan. Los archivos `.env` contienen claves: no los compartas ni los subas a un repositorio.

---

### Paso 4️⃣: El Frontend

No necesita instalación ni compilación. Las direcciones de los dos servicios están en `FRONTEND/js/config.js`:

```js
const API_BASE_URL = 'http://localhost:3000/api';
const AUTH_API_BASE_URL = 'http://localhost:3001/api';
```

Cámbialas solo si cambias los puertos.

---

## Comandos para Iniciar la Aplicación

Deben estar en ejecución MySQL, **los dos backends** y un servidor para el frontend.

### Opción 1: Terminales Separadas (Recomendado)

#### Terminal 1️⃣: Servicio de autenticación

```bash
cd BACKEND_SRV_1
npm start
```

```
Servicio de autenticacion escuchando en http://localhost:3001
Conexion a MySQL exitosa (authentication@localhost:3306)
```

#### Terminal 2️⃣: Servicio de gestión personal

```bash
cd BACKEND_SRV_2
npm start
```

```
Servidor escuchando en http://localhost:3000
Conexion a MySQL exitosa (personal_management@localhost:3306)
```

> Un servicio arranca aunque falle la conexión a MySQL. Confirma que aparezca la línea `Conexion a MySQL exitosa`.

> `npm start` no recarga los cambios: reinicia el servicio si cambias el código o el `.env`. Durante el desarrollo puedes usar `npm run dev`, que reinicia solo al cambiar el código (no al cambiar el `.env`).

#### Terminal 3️⃣: Frontend

Elige una de estas opciones:

| Opción | Cómo iniciarlo | Dirección de acceso |
|--------|----------------|---------------------|
| Python 3 | `cd FRONTEND && python3 -m http.server 8000` | http://localhost:8000/login.html |
| Node.js | `cd FRONTEND && npx http-server -p 8000 -c-1` | http://localhost:8000/login.html |
| Live Server (VS Code) | Abrir la raíz del proyecto y pulsar **Go Live** | http://127.0.0.1:5500/FRONTEND/login.html |

---

### Opción 2: Un Solo Script (macOS/Linux)

Crea un archivo `run-all.sh` en la raíz del proyecto:

```bash
#!/bin/bash
# Inicia los dos microservicios y el frontend. Ctrl + C detiene todo.
cd "$(dirname "$0")" || exit 1

PIDS=()
(cd BACKEND_SRV_1 && exec npm start) & PIDS+=($!)
(cd BACKEND_SRV_2 && exec npm start) & PIDS+=($!)
(cd FRONTEND && exec python3 -m http.server 8000) & PIDS+=($!)
trap 'kill "${PIDS[@]}" 2>/dev/null' EXIT

echo "Login: http://localhost:8000/login.html"
echo "Presiona Ctrl+C para detener la aplicacion"
wait
```

Uso:

```bash
chmod +x run-all.sh
./run-all.sh
```

---

## Detener los Servidores

- **Terminales separadas:** presiona `Ctrl + C` en cada una de las tres.
- **Script `run-all.sh`:** presiona `Ctrl + C` una vez.
- **Live Server:** pulsa el botón del puerto en la barra inferior de VS Code.

### Si un puerto sigue ocupado

| Puerto | Qué corre ahí |
|--------|---------------|
| 3001 | Autenticación |
| 3000 | Gestión personal |
| 8000 | Frontend |

```bash
# macOS/Linux: buscar el PID y detener el proceso
lsof -i :3001
kill <PID>        # si no responde: kill -9 <PID>

# Windows (PowerShell)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Detener MySQL (opcional)

```bash
# macOS con el instalador oficial: Ajustes del Sistema → MySQL → Stop
brew services stop mysql       # macOS con Homebrew
sudo systemctl stop mysql      # Linux
# Windows: services.msc → MySQL → Detener
```

---

## Autenticación

### Flujo de inicio de sesión

1. En `login.html` se escriben usuario y contraseña.
2. `BACKEND_SRV_1` busca la cuenta, calcula el hash de la contraseña recibida y lo compara con el guardado.
3. Si coincide, responde con un **token JWT**; el frontend lo guarda y redirige a `index.html`.
4. Cada petición a `BACKEND_SRV_2` envía `Authorization: Bearer <token>`.
5. Si el token falta, es falso o expiró, el servicio responde **401** y el frontend regresa al login.

Además:

- Entrar a `index.html` sin sesión redirige al login; entrar al login con sesión redirige a `index.html`.
- La sesión se guarda en `sessionStorage`: dura lo que dure la pestaña, y como máximo 1 hora (`JWT_EXPIRES_IN`).
- **Cerrar sesión** borra el token del navegador.

### Cómo se guardan las contraseñas

La columna `password` guarda `sal:hash`:

- **sal:** 32 caracteres hexadecimales aleatorios, distintos en cada cuenta.
- **hash:** `SHA-256(sal + contraseña)`, 64 caracteres hexadecimales.

SHA-2 es una función **hash**, no un cifrado: la contraseña no se puede "descifrar". Para validarla se repite el cálculo y se comparan los resultados. La sal hace que dos cuentas con la misma contraseña tengan hashes distintos.

El token está **firmado, no cifrado**: nadie puede modificarlo sin el secreto, pero su contenido (id, usuario y fechas) se puede leer.

### Administrar cuentas

No hay pantalla de registro. Las cuentas se manejan con SQL como administrador, porque `personal_manager` solo puede leerlas:

```bash
mysql --default-character-set=utf8mb4 -u root -p authentication
```

**Crear una cuenta** (cambia `maria` y `Contraseña2026*`):

```sql
SET @sal = LOWER(HEX(RANDOM_BYTES(16)));
INSERT INTO CUENTA (username, password)
VALUES ('maria', CONCAT(@sal, ':', SHA2(CONCAT(@sal, 'Contraseña2026*'), 256)));
```

**Cambiar una contraseña:**

```sql
SET @sal = LOWER(HEX(RANDOM_BYTES(16)));
UPDATE CUENTA SET password = CONCAT(@sal, ':', SHA2(CONCAT(@sal, 'NuevaClave2026*'), 256))
WHERE username = 'maria';
```

**Eliminar una cuenta:**

```sql
DELETE FROM CUENTA WHERE username = 'maria';
```

El nombre de usuario admite hasta 45 caracteres.

### Limitaciones (proyecto educativo)

Antes de usar la aplicación fuera de un entorno de práctica habría que resolver:

- No hay límite de intentos de inicio de sesión.
- No hay cierre de sesión en el servidor: un token sigue siendo válido hasta que expira, aunque se cambie la contraseña o se elimine la cuenta.
- SHA-256 es muy rápido, lo que facilita probar contraseñas; en producción se usa un algoritmo como bcrypt o Argon2.
- Las comunicaciones van por HTTP sin cifrar; se necesita HTTPS.
- CORS acepta cualquier origen.
- La contraseña de la cuenta `admin` es pública (está en este documento): cámbiala.

---

## Estructura del Proyecto

```
Taller_Microservicios/
│
├── README.md                             (Este archivo)
├── CLAUDE.md                             (Guía para Claude)
│
├── parametrization/
│   └── db_relational_model/
│       ├── DB_relational_model.sql       (Base personal_management)
│       └── DB_authentication_model.sql   (Base authentication, permisos y cuenta admin)
│
├── BACKEND_SRV_1/                        (Microservicio de autenticación, puerto 3001)
│   ├── src/
│   │   ├── index.js                      (Punto de entrada)
│   │   ├── config/                       (app.js, database.js, environment.js)
│   │   ├── routes/                       (index.js, authRoutes.js)
│   │   ├── controllers/                  (authController.js)
│   │   ├── services/                     (authService.js)
│   │   ├── models/                       (Cuenta.js)
│   │   ├── middleware/                   (validateInput.js, errorHandler.js)
│   │   └── utils/
│   │       ├── password.js               (Hash SHA-256 con sal)
│   │       ├── token.js                  (Firma del JWT)
│   │       ├── validators.js             (Campos obligatorios)
│   │       └── helpers.js                (Funciones auxiliares)
│   ├── tests/
│   ├── package.json
│   ├── .env.example
│   └── .env                              (No se comparte)
│
├── BACKEND_SRV_2/                        (Microservicio de gestión personal, puerto 3000)
│   ├── src/
│   │   ├── index.js                      (Punto de entrada)
│   │   ├── config/                       (app.js, database.js, environment.js)
│   │   ├── routes/                       (Usuarios, teléfonos, redes y perfiles)
│   │   ├── controllers/                  (Manejan las peticiones)
│   │   ├── services/                     (Lógica de negocio y SQL)
│   │   ├── models/                       (Usuario, Telefono, RedSocial, PerfilSocial)
│   │   ├── middleware/
│   │   │   ├── autenticacion.js          (Verifica el token)
│   │   │   ├── validateInput.js          (Validación de datos)
│   │   │   └── errorHandler.js           (Manejo de errores)
│   │   └── utils/                        (helpers, sanitizers, validators, constants)
│   ├── tests/
│   ├── package.json
│   ├── .env.example
│   └── .env                              (No se comparte)
│
└── FRONTEND/
    ├── login.html                        (Inicio de sesión)
    ├── index.html                        (Módulo de gestión, requiere sesión)
    ├── css/                              (tokens, main, atoms, molecules, organisms)
    └── js/
        ├── config.js                     (Direcciones de los dos servicios)
        ├── login.js                      (Lógica de la página de login)
        ├── main.js                       (Arranque del módulo y cierre de sesión)
        ├── api/                          (authApi y una por cada entidad)
        ├── utils/
        │   ├── dom.js                    (Utilidades DOM)
        │   └── sesion.js                 (Token y fetchConSesion)
        ├── molecules/                    (comboboxBuscable.js)
        └── organisms/                    (Un módulo por entidad)
```

---

## Pruebas Automatizadas

Cada servicio tiene sus propias pruebas. No hace falta que los servidores estén corriendo.

```bash
(cd BACKEND_SRV_1 && npm test)
(cd BACKEND_SRV_2 && npm test)
```

| Servicio | Archivo | Qué prueba | ¿Usa MySQL? |
|----------|---------|------------|-------------|
| Autenticación | `password.test.js` | Hash y verificación de contraseñas | No |
| Autenticación | `api.test.js` | Login, errores, script SQL y permisos | Temporal |
| Gestión | `models.test.js` | Validaciones de los modelos | No |
| Gestión | `services.test.js` | Services con la base simulada | No |
| Gestión | `api.test.js` | API completa y rechazo de tokens inválidos | Temporal |

Las pruebas con MySQL arrancan un servidor **temporal y privado** (no tocan tus bases de datos). Si no se encuentra el ejecutable `mysqld`, indícalo con la variable `MYSQLD_PATH`.

---

## Modelo de Datos

Hay dos bases de datos independientes: `authentication` (cuentas de acceso) y `personal_management` (datos de gestión).

### Base `authentication`

#### CUENTA

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK) | Identificador único, auto-incrementado |
| `username` | VARCHAR(45) | Nombre de usuario, único |
| `password` | VARCHAR(97) | `sal:hash` (ver [Autenticación](#autenticación)) |

### Base `personal_management`

### Diagrama Entidad-Relación (ER)

```
┌──────────────────────────┐
│        USUARIO           │
├──────────────────────────┤
│ id (PK)                  │
│ primer_nombre            │
│ segundo_nombre           │
│ primer_apellido          │
│ segundo_apellido         │
│ fecha_nacimiento         │
│ edad                     │
│ ciudad_domicilio         │
│ estado (1=activo, 0=inac)│
└──────────────────────────┘
         ▲          ▲
         │          │ 1:N
         │ 1:N      │
    ┌────┴──────────┴────┐
    │                    │
┌───┴────────────────┐  ┌┴──────────────────────────┐
│    TELEFONO        │  │    PERFIL_SOCIAL         │
├────────────────────┤  ├──────────────────────────┤
│ id (PK)            │  │ RED_SOCIAL_id (PK, FK)   │
│ numero_telefono    │  │ USUARIO_id (PK, FK)      │
│ tipo_telefono      │  │ url_perfil               │
│ USUARIO_id (FK)    │  │                          │
│ activo             │  └──────────────┬───────────┘
└────────────────────┘                 │ N:M
                                       │
                              ┌────────┴─────────┐
                              │                  │
                        ┌─────┴────────────────┐ │
                        │   RED_SOCIAL        │ │
                        ├────────────────────┤ │
                        │ id (PK)            │ │
                        │ nombre             │◄┘
                        │ url                │
                        └────────────────────┘

Relaciones:
- Un USUARIO puede tener muchos TELEFONOS (1:N)
- Un USUARIO puede tener muchos PERFILES_SOCIALES (1:N)
- Una RED_SOCIAL puede tener muchos PERFILES_SOCIALES (1:N)
- PERFIL_SOCIAL es tabla intermedia (N:M) entre USUARIO y RED_SOCIAL
```

### Descripción de Tablas

#### USUARIO
Almacena la información de los usuarios del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK) | Identificador único, auto-incrementado |
| `primer_nombre` | VARCHAR(45) | Nombre principal del usuario |
| `segundo_nombre` | VARCHAR(45) | Segundo nombre (opcional) |
| `primer_apellido` | VARCHAR(45) | Primer apellido del usuario |
| `segundo_apellido` | VARCHAR(45) | Segundo apellido (opcional) |
| `fecha_nacimiento` | DATETIME | Fecha de nacimiento |
| `edad` | INT | Edad en años (calculada automáticamente) |
| `ciudad_domicilio` | VARCHAR(45) | Ciudad de residencia |
| `estado` | INT | 1=Activo, 0=Inactivo (borrado lógico) |

#### TELEFONO
Almacena los números de teléfono de los usuarios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK) | Identificador único, auto-incrementado |
| `numero_telefono` | VARCHAR(45) | Número de teléfono |
| `tipo_telefono` | VARCHAR(45) | Tipo: Celular, Fijo, Trabajo, Otro |
| `USUARIO_id` | INT (FK) | Referencia a USUARIO (relación 1:N) |
| `activo` | INT | 1=Activo, 0=Inactivo |

#### RED_SOCIAL
Catálogo de redes sociales disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (PK) | Identificador único, auto-incrementado |
| `nombre` | VARCHAR(45) | Nombre de la red social |
| `url` | VARCHAR(45) | Sitio web de la red social |

#### PERFIL_SOCIAL
Tabla intermedia que vincula usuarios con redes sociales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `RED_SOCIAL_id` | INT (PK, FK) | Referencia a RED_SOCIAL |
| `USUARIO_id` | INT (PK, FK) | Referencia a USUARIO |
| `url_perfil` | VARCHAR(45) | URL del perfil del usuario en esa red social |

---

## API REST - Endpoints Disponibles

### Base URL

| Servicio | URL base | ¿Requiere token? |
|----------|----------|------------------|
| Autenticación | `http://localhost:3001/api` | No |
| Gestión personal | `http://localhost:3000/api` | **Sí, en todas las rutas** |

`GET /` en cada puerto (sin `/api`) responde un mensaje para comprobar que el servicio está arriba.

### 🔐 Iniciar sesión

```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123*"
}
```

**Respuesta (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": { "id": 1, "username": "admin" }
}
```

| Código | Respuesta | Causa |
|--------|-----------|-------|
| 400 | `{"error":"Datos invalidos","detalles":[...]}` | Falta `username` o `password` |
| 401 | `{"error":"Usuario o contrasenia incorrectos"}` | Usuario inexistente o contraseña errada (mismo mensaje a propósito) |

### Usar el token

Todos los endpoints que siguen son del puerto 3000 y necesitan esta cabecera:

```
Authorization: Bearer <token>
```

| Código | Respuesta | Causa |
|--------|-----------|-------|
| 401 | `{"error":"Debe iniciar sesion para usar este servicio"}` | No se envió el token |
| 401 | `{"error":"La sesion no es valida o ya expiro"}` | Token alterado, expirado o firmado con otro secreto |

### Códigos de estado

| Código | Significado |
|--------|-------------|
| 200 / 201 | Operación correcta / registro creado |
| 400 | Datos inválidos o referencia inexistente |
| 401 | Sin sesión válida o credenciales incorrectas |
| 404 | Registro o ruta no encontrada |
| 409 | Registro duplicado o relacionado con otros datos |
| 500 | Error interno del servidor |

---

### 📋 Usuarios

#### Listar todos los usuarios
```bash
GET /api/usuarios
```

Solo devuelve usuarios activos. En la lista, `telefonos` y `perfilesSociales` van vacíos.

**Respuesta (200 OK):**
```json
[
  {
    "id": 1,
    "primerNombre": "Juan",
    "segundoNombre": null,
    "primerApellido": "Pérez",
    "segundoApellido": null,
    "nombreCompleto": "Juan Pérez",
    "fechaNacimiento": "1995-06-15T05:00:00.000Z",
    "edad": 28,
    "ciudadDomicilio": "Bogotá",
    "estado": 1,
    "telefonos": [],
    "perfilesSociales": []
  }
]
```

#### Obtener un usuario específico (con sus teléfonos y perfiles)
```bash
GET /api/usuarios/:id
```

**Parámetro:**
- `:id` - ID del usuario

**Respuesta (200 OK):**
```json
{
  "id": 1,
  "primerNombre": "Juan",
  "nombreCompleto": "Juan Pérez",
  "edad": 28,
  "ciudadDomicilio": "Bogotá",
  "estado": 1,
  "telefonos": [
    {
      "id": 1,
      "numeroTelefono": "3001234567",
      "tipoTelefono": "Celular",
      "usuarioId": 1,
      "activo": 1
    }
  ],
  "perfilesSociales": [
    {
      "redSocialId": 1,
      "usuarioId": 1,
      "urlPerfil": "https://instagram.com/juan",
      "redSocial": {
        "id": 1,
        "nombre": "Instagram",
        "url": "https://instagram.com"
      },
      "usuario": "Juan Pérez"
    }
  ]
}
```

#### Crear un nuevo usuario
```bash
POST /api/usuarios
Content-Type: application/json

{
  "primerNombre": "Juan",
  "segundoNombre": null,
  "primerApellido": "Pérez",
  "segundoApellido": null,
  "fechaNacimiento": "1995-06-15",
  "ciudadDomicilio": "Bogotá"
}
```

**Respuesta (201 Created):** [igual al GET]

#### Actualizar un usuario
No cambia el `estado` del usuario.

```bash
PUT /api/usuarios/:id
Content-Type: application/json

{
  "primerNombre": "Juan Carlos",
  "segundoNombre": null,
  "primerApellido": "Pérez",
  "segundoApellido": null,
  "fechaNacimiento": "1995-06-15",
  "ciudadDomicilio": "Medellín"
}
```

**Respuesta (200 OK):** [igual al GET]

#### Eliminar un usuario (borrado lógico)
```bash
DELETE /api/usuarios/:id
```

**Respuesta (200 OK):**
```json
{
  "mensaje": "Usuario desactivado correctamente"
}
```

---

### ☎️ Teléfonos

#### Listar todos los teléfonos
```bash
GET /api/telefonos
```

#### Listar teléfonos de un usuario específico
```bash
GET /api/telefonos/usuario/:usuarioId
```

#### Crear un nuevo teléfono
```bash
POST /api/telefonos
Content-Type: application/json

{
  "usuarioId": 1,
  "numeroTelefono": "3001234567",
  "tipoTelefono": "Celular",
  "activo": 1
}
```

#### Actualizar un teléfono
No cambia el dueño del teléfono. Si no se envía `activo`, queda en 1.

```bash
PUT /api/telefonos/:id
Content-Type: application/json

{
  "usuarioId": 1,
  "numeroTelefono": "3009876543",
  "tipoTelefono": "Celular",
  "activo": 1
}
```

#### Eliminar un teléfono
```bash
DELETE /api/telefonos/:id
```

---

### 🌐 Redes Sociales

#### Listar todas las redes sociales
```bash
GET /api/redes-sociales
```

**Respuesta (200 OK):**
```json
[
  {
    "id": 1,
    "nombre": "Instagram",
    "url": "https://instagram.com"
  },
  {
    "id": 2,
    "nombre": "Facebook",
    "url": "https://facebook.com"
  }
]
```

#### Crear una nueva red social
```bash
POST /api/redes-sociales
Content-Type: application/json

{
  "nombre": "Twitter",
  "url": "https://twitter.com"
}
```

#### Actualizar una red social
```bash
PUT /api/redes-sociales/:id
Content-Type: application/json

{
  "nombre": "Twitter X",
  "url": "https://x.com"
}
```

#### Eliminar una red social
```bash
DELETE /api/redes-sociales/:id
```

**Nota:** No se puede eliminar si tiene perfiles sociales asociados → Error 409 Conflict

---

### 📱 Perfiles Sociales

#### Listar todos los perfiles sociales
```bash
GET /api/perfiles-sociales
```

**Respuesta (200 OK):**
```json
[
  {
    "redSocialId": 1,
    "usuarioId": 1,
    "urlPerfil": "https://instagram.com/juan",
    "redSocial": {
      "id": 1,
      "nombre": "Instagram",
      "url": "https://instagram.com"
    },
    "usuario": "Juan Pérez"
  }
]
```

#### Listar perfiles de un usuario específico
```bash
GET /api/perfiles-sociales/usuario/:usuarioId
```

#### Crear un nuevo perfil social
```bash
POST /api/perfiles-sociales
Content-Type: application/json

{
  "usuarioId": 1,
  "redSocialId": 1,
  "urlPerfil": "https://instagram.com/juan"
}
```

#### Actualizar un perfil social
```bash
PUT /api/perfiles-sociales/:redSocialId/:usuarioId
Content-Type: application/json

{
  "urlPerfil": "https://instagram.com/juanperez"
}
```

#### Eliminar un perfil social
```bash
DELETE /api/perfiles-sociales/:redSocialId/:usuarioId
```

---

## Cómo Usar la Aplicación

### 1. Iniciar y cerrar sesión 🔐

1. Con los tres servidores en ejecución, abre `login.html` (por ejemplo http://localhost:8000/login.html)
2. Escribe usuario y contraseña (`admin` / `Admin123*`) y pulsa **"Ingresar"**
3. Verás la interfaz principal con 4 pestañas y tu nombre de usuario arriba a la derecha
4. Para salir, pulsa **"Cerrar sesión"**

Si la sesión expira mientras trabajas, la aplicación vuelve al login con el aviso *"Su sesión expiró, ingrese nuevamente"*.

---

### 2. Módulo de Usuarios 👤

#### Crear un usuario
1. Asegúrate de estar en la pestaña **"Usuarios"**
2. Completa el formulario con:
   - **Primer nombre** (obligatorio)
   - **Segundo nombre** (opcional)
   - **Primer apellido** (obligatorio)
   - **Segundo apellido** (opcional)
   - **Fecha de nacimiento** (obligatorio) - la edad se calcula automáticamente; no puede ser una fecha futura
   - **Ciudad de domicilio** (obligatorio)
3. Haz clic en **"Crear Usuario"**
4. Deberías ver una notificación de éxito y el usuario aparecerá en la tabla

#### Editar un usuario
1. En la tabla de usuarios, haz clic en el botón **"Editar"**
2. El formulario se llenará con los datos del usuario
3. Modifica los campos que necesites cambiar
4. Haz clic en **"Guardar Cambios"**
5. La tabla se actualizará automáticamente

#### Eliminar un usuario
1. En la tabla de usuarios, haz clic en el botón **"Eliminar"**
2. Confirma la acción en el cuadro de diálogo
3. El usuario se desactivará (estado = 0) pero no se eliminará físicamente

---

### 3. Módulo de Teléfonos ☎️

#### Crear un teléfono
1. Ve a la pestaña **"Teléfonos"**
2. Selecciona un usuario del dropdown
3. Ingresa el número de teléfono (ej: 3001234567)
4. Selecciona el tipo de teléfono (Celular, Fijo, Trabajo, Otro)
5. Marca la casilla "Activo" si deseas que esté activo
6. Haz clic en **"Crear Teléfono"**

#### Editar/Eliminar un teléfono
- Similar a usuarios, usa los botones **"Editar"** o **"Eliminar"** en la tabla
- Al editar, el usuario dueño del teléfono queda bloqueado: no se puede cambiar

---

### 4. Módulo de Redes Sociales 🌐

#### Crear una red social
1. Ve a la pestaña **"Redes Sociales"**
2. Ingresa el nombre (ej: LinkedIn)
3. Ingresa la URL (ej: https://linkedin.com)
4. Haz clic en **"Crear Red Social"**

#### Editar/Eliminar una red social
- Similar a usuarios, usa los botones **"Editar"** o **"Eliminar"** en la tabla

---

### 5. Módulo de Perfiles Sociales 📱

#### Crear un perfil social
1. Ve a la pestaña **"Perfiles Sociales"**
2. Selecciona un usuario del dropdown
3. Selecciona una red social del dropdown
4. Ingresa la URL del perfil en esa red social (opcional)
5. Haz clic en **"Crear Perfil Social"**

#### Editar/Eliminar un perfil social
- Similar a usuarios, usa los botones **"Editar"** o **"Eliminar"** en la tabla

---

## Tecnologías Utilizadas

### Backend

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express.js** | 4.x | Framework web |
| **mysql2** | 3.x | Conector MySQL |
| **cors** | 2.x | Control de acceso Cross-Origin |
| **dotenv** | 16.x | Gestión de variables de entorno |
| **jsonwebtoken** | 9.x | Firma y verificación de tokens JWT |
| **crypto** | incluido en Node.js | Hash SHA-256 de contraseñas |
| **node:test** | incluido en Node.js | Pruebas automatizadas |
| **nodemon** | 3.x | Recarga en desarrollo |

### Frontend

| Tecnología | Propósito |
|-----------|----------|
| **HTML5** | Estructura del documento |
| **CSS3** | Estilos y diseño responsivo |
| **JavaScript ES6+** | Lógica de la aplicación |
| **Fetch API** | Comunicación con el backend |
| **sessionStorage** | Guarda la sesión del usuario |
| **Atomic Design** | Metodología de componentes |

### Base de Datos

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **MySQL** | 8.0+ | Sistema gestor de base de datos |
| **SQL** | Estándar | Lenguaje de consultas |

---

## 🎓 Conceptos Educativos Abordados

Este proyecto enseña los siguientes conceptos de desarrollo web:

### Autenticación y microservicios

✅ **Microservicios**
- Un servicio por responsabilidad, cada uno con su base de datos

✅ **Seguridad**
- Hash de contraseñas (SHA-256 con sal)
- Tokens JWT firmados
- Mínimo privilegio en la base de datos
- Protección de rutas con middleware

### Backend (Node.js + Express)

✅ **Arquitectura en capas**
- Separación de responsabilidades (Controllers, Services, Models)
- Independencia de cada capa

✅ **Gestión de base de datos**
- SQL parametrizado (prevención de inyección SQL)
- Pool de conexiones
- Relaciones entre tablas

✅ **API REST**
- Métodos HTTP (GET, POST, PUT, DELETE)
- Códigos de estado HTTP (200, 201, 400, 401, 404, 409)
- Validación de datos

✅ **Middleware**
- CORS (Cross-Origin Resource Sharing)
- Manejo centralizado de errores
- Validación de entrada

✅ **Async/Await**
- Operaciones asincrónicas
- Manejo de promesas

### Frontend (JavaScript Vanilla)

✅ **DOM Manipulation**
- Selección y modificación de elementos
- Eventos del usuario

✅ **Fetch API**
- Comunicación HTTP con el backend
- Manejo de respuestas JSON

✅ **Atomic Design**
- Atoms (botones, inputs)
- Molecules (formularios, tablas)
- Organisms (módulos completos)

✅ **Responsividad**
- CSS Grid y Flexbox
- Media queries

✅ **Encapsulación**
- Patrones de módulos (IIFE)
- Scope y closures

### Base de Datos

✅ **Modelo Relacional**
- Tablas y relaciones
- Claves primarias y foráneas
- Integridad referencial

✅ **Normalizacion**
- Primera forma normal (1NF)
- Segunda forma normal (2NF)
- Tercera forma normal (3NF)

---

## Solución de Problemas

### Al iniciar sesión

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| *"No fue posible conectar con el servicio de autenticación"* | `BACKEND_SRV_1` no está corriendo | Inícialo y revisa el puerto 3001 |
| *"Error interno del servidor"* | No se creó la base `authentication` o falló la conexión a MySQL | Ejecuta el paso 1.3 y revisa la consola del servicio |
| *"Usuario o contrasenia incorrectos"* | Datos errados (la contraseña distingue mayúsculas) | Revisa la cuenta o [cámbiale la contraseña](#autenticación) |
| Entra y enseguida vuelve al login con *"Su sesión expiró"* | `JWT_SECRET` es distinto en los dos servicios | Iguala el valor y **reinicia ambos** |

### Al iniciar un servicio

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `Falta la variable JWT_SECRET en el archivo .env` | Falta el secreto | Completa el paso 3 |
| `No fue posible conectar a la base de datos MySQL` | MySQL detenido, credenciales o base incorrectas | Inicia MySQL y revisa el `.env` |
| `EADDRINUSE` | El puerto ya está ocupado (quizá por una ejecución anterior) | [Detén el proceso](#detener-los-servidores) |
| `Cannot find module 'jsonwebtoken'` | Faltan dependencias | `npm install` en ese servicio |

### Al ejecutar el script de autenticación

`ERROR 1410 ... You are not allowed to create a user with GRANT` significa que `personal_manager` todavía no existe: haz el paso 1.2 y vuelve a ejecutar el script.

### En la aplicación

**Las tablas quedan vacías y aparece un aviso de error de red** (por ejemplo `Failed to fetch`): `BACKEND_SRV_2` no está corriendo o `FRONTEND/js/config.js` apunta a otro puerto.

**Los datos no aparecen después de crear un registro:**

1. Abre la consola del navegador (F12) y revisa si hay errores
2. Verifica en MySQL si se insertó: `SELECT * FROM USUARIO;`
3. Reinicia los servicios

---

## 📚 Recursos Adicionales

### Documentación

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MySQL Reference](https://dev.mysql.com/doc/refman/8.0/en/)
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript)

### Tutoriales Recomendados

- [RESTful API Design](https://www.restapitutorial.com/)
- [SQL Tutorial](https://www.w3schools.com/sql/)
- [CSS Grid and Flexbox](https://css-tricks.com/)

---

## ✅ Verificación Final

Con todo en ejecución (si usas Live Server, cambia la última dirección):

```bash
# 1. Los dos servicios responden
curl http://localhost:3001/
curl http://localhost:3000/

# 2. Sin token, la API responde 401
curl -i http://localhost:3000/api/usuarios

# 3. Iniciar sesión y guardar el token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"Admin123*"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

# 4. Con token, la API responde los datos
curl http://localhost:3000/api/usuarios -H "Authorization: Bearer $TOKEN"

# 5. El frontend carga
curl -I http://localhost:8000/login.html
```

---

## 🎯 Conclusión

¡Felicidades! Ahora tienes una aplicación web completa y funcional. 

Este proyecto te ha permitido aprender:
- ✅ Arquitectura backend en capas
- ✅ Separación en microservicios
- ✅ Autenticación con contraseñas en hash y tokens
- ✅ Desarrollo de APIs REST
- ✅ Manipulación del DOM con JavaScript puro
- ✅ Diseño responsivo con CSS3
- ✅ Gestión de bases de datos relacionales

Ahora puedes:
- 🚀 Desplegar la aplicación en un servidor
- 🔒 Agregar roles y permisos, registro de cuentas y límite de intentos
- 📊 Implementar paginación y filtros
- 🎨 Mejorar el diseño de la interfaz
- 📱 Hacer la app responsive en móviles

---

**Autor**: SENA - Programa de Formación  
**Fecha**: Noviembre 2026  
**Tecnologías**: Node.js, Express, MySQL, JWT, JavaScript, HTML5, CSS3

---

¿Tienes preguntas? Revisa el archivo `CLAUDE.md` para más detalles técnicos.
