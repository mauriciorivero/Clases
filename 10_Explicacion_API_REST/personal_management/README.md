# 📋 Sistema de Gestión Personal

Un sistema web completo para administrar usuarios, teléfonos, redes sociales y perfiles sociales. 
Construido con **Node.js/Express** (backend), **MySQL** (base de datos) y **JavaScript vanilla** (frontend).

**Propósito educativo**: Proyecto del programa SENA para enseñar desarrollo web full-stack con arquitectura en capas.

---

## 📚 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Requisitos Previos](#requisitos-previos)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Comandos para Iniciar la Aplicación](#comandos-para-iniciar-la-aplicación)
6. [Detener los Servidores](#detener-los-servidores)
7. [Estructura del Proyecto](#estructura-del-proyecto) · [Pruebas](#-pruebas-automatizadas)
8. [Modelo de Datos](#modelo-de-datos)
9. [API REST - Endpoints Disponibles](#api-rest---endpoints-disponibles)
10. [Cómo Usar la Aplicación](#cómo-usar-la-aplicación)
11. [Tecnologías Utilizadas](#tecnologías-utilizadas)

---

## Descripción General

### ¿Qué hace esta aplicación?

Esta aplicación permite a los usuarios:

- 👤 **Crear y administrar usuarios** con información personal (nombre, fecha de nacimiento, ciudad)
- ☎️ **Gestionar teléfonos** asociados a cada usuario
- 🌐 **Catalogar redes sociales** disponibles (Facebook, Instagram, Twitter, etc.)
- 📱 **Crear perfiles sociales** para vincular usuarios con redes sociales específicas

### Características Principales

✅ CRUD completo (Crear, Leer, Actualizar, Eliminar) para todas las entidades  
✅ Interfaz de usuario intuitiva con navegación por pestañas  
✅ Validación de datos en tiempo real  
✅ Manejo centralizado de errores  
✅ Soporte CORS para comunicación frontend-backend  
✅ Cálculo automático de edad a partir de fecha de nacimiento  
✅ Borrado lógico de usuarios (no se elimina físicamente)

---

## Arquitectura del Sistema

### Diagrama General de la Aplicación

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR WEB                           │
│              (http://localhost:8000)                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    FRONTEND (Vanilla JS)                  │ │
│  │                                                           │ │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────────┐ │ │
│  │  │ Usuarios│  │Teléfonos │  │ Redes   │  │ Perfiles   │ │ │
│  │  │         │  │          │  │Sociales │  │ Sociales   │ │ │
│  │  └─────────┘  └──────────┘  └─────────┘  └────────────┘ │ │
│  │                    (Pestañas)                            │ │
│  │                                                           │ │
│  │  Tecnologías:                                            │ │
│  │  • HTML5 + CSS3 (Diseño Vercel)                         │ │
│  │  • JavaScript ES6+ (async/await, fetch)                 │ │
│  │  • Atomic Design (atoms, molecules, organisms)          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                           ↕️ CORS                              │
└─────────────────────────────────────────────────────────────────┘
                    fetch (JSON + Authorization)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                  │
│                  (http://localhost:3000/api)                    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                    CAPA DE RUTAS                          ││
│  │  /api/usuarios  /api/telefonos  /api/redes-sociales      ││
│  │  /api/perfiles-sociales                                  ││
│  └────────────────────────────────────────────────────────────┘│
│                            ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                 CAPA DE CONTROLADORES                     ││
│  │  Parsean requests HTTP y coordinan respuestas            ││
│  └────────────────────────────────────────────────────────────┘│
│                            ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                  CAPA DE SERVICIOS                        ││
│  │  Lógica de negocio (validaciones, reglas)                ││
│  └────────────────────────────────────────────────────────────┘│
│                            ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐│
│  │               CAPA DE MODELOS (DAO)                       ││
│  │  SQL parametrizado contra la base de datos               ││
│  └────────────────────────────────────────────────────────────┘│
│                            ↓                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS MySQL                          │
│                  (personal_management)                          │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ USUARIO  │  │ TELEFONO │  │RED_SOCIAL│  │PERFIL_SOCIAL │  │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────────┤  │
│  │ id       │  │ id       │  │ id       │  │ RED_SOCIAL_id│  │
│  │ nombres  │  │ numero   │  │ nombre   │  │ USUARIO_id   │  │
│  │ apellidos│  │ tipo     │  │ url      │  │ url_perfil   │  │
│  │ fecha_nac│  │ USUARIO_ │  └──────────┘  └──────────────┘  │
│  │ edad     │  │   id(FK) │        ↑             ↑             │
│  │ ciudad   │  │ activo   │        └─────┬───────┘             │
│  │ estado   │  └──────────┘              │                     │
│  │          │        ↑                   │                     │
│  └──────────┘        │                   │                     │
│       ↑              └───────┬───────────┘                      │
│       └──────────────────────┘                                 │
│                                                                 │
│  Relaciones: 1 Usuario → N Teléfonos, N Perfiles Sociales    │
└─────────────────────────────────────────────────────────────────┘
```

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
   {"primerNombre": "Juan", ...}          {"primerNombre": "Juan", ...}
        ↓                                           ↓
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
| **Node.js** | 14.0.0 | Runtime de JavaScript para el backend |
| **npm** | 6.0.0 | Gestor de paquetes de Node.js |
| **MySQL** | 5.7 | Sistema de gestión de base de datos |
| **MySQL Cliente** | 5.7 | Herramienta de línea de comandos (mysql) |

### Verificar las Instalaciones

```bash
# Verifica Node.js
node -v
# Resultado esperado: v18.0.0 o superior

# Verifica npm
npm -v
# Resultado esperado: 9.0.0 o superior

# Verifica MySQL
mysql --version
# Resultado esperado: mysql Ver 8.0 o superior
```

### Credenciales de Base de Datos

La aplicación utiliza las siguientes credenciales (definidas en `notas_implementacion.md`):

```
HOST: localhost
PUERTO: 3306
BASE DE DATOS: personal_management
USUARIO: personal_manager
CONTRASEÑA: person_123456*
```

---

## Instalación y Configuración

### Paso 1️⃣: Configurar la Base de Datos

#### 1.1 Crear el esquema y las tablas

```bash
# Desde la raíz del proyecto
mysql -u root -p < parametrization/db_relational_model/DB_relational_model.sql

# Se te pedirá la contraseña de root de MySQL
# Ingresa la contraseña y presiona Enter
```

#### 1.2 Crear el usuario personal_manager (si no existe)

Conectarse a MySQL como root:

```bash
mysql -u root -p
```

Dentro de la consola de MySQL, ejecuta:

```sql
-- Crear el usuario
CREATE USER 'personal_manager'@'localhost' IDENTIFIED BY 'person_123456*';

-- Darle todos los privilegios en la base de datos
GRANT ALL PRIVILEGES ON personal_management.* TO 'personal_manager'@'localhost';

-- Aplicar los cambios
FLUSH PRIVILEGES;

-- Salir de MySQL
EXIT;
```

#### 1.3 Verificar la conexión

```bash
# Conectarse con el usuario creado
mysql -u personal_manager -p personal_management

# Te pedirá la contraseña: person_123456*
# Ejecuta esto para verificar las tablas:
SHOW TABLES;

# Deberías ver 4 tablas:
# +---------------------------+
# | Tables_in_personal_management |
# +---------------------------+
# | PERFIL_SOCIAL            |
# | RED_SOCIAL               |
# | TELEFONO                 |
# | USUARIO                  |
# +---------------------------+

EXIT;
```

---

### Paso 2️⃣: Instalar Dependencias del Backend

```bash
# Ir a la carpeta del backend
cd BACKEND

# Instalar todas las dependencias npm
npm install

# Verificar que se instaló correctamente
npm list

# Debería mostrar packages como:
# ├── cors
# ├── dotenv
# ├── express
# └── mysql2
```

---

### Paso 3️⃣: Configurar Variables de Entorno

El archivo `.env` ya está configurado con los valores correctos:

```bash
# En la carpeta BACKEND, verifica el contenido de .env
cat .env

# Deberías ver:
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=personal_management
# DB_USER=personal_manager
# DB_PASSWORD=person_123456*
# SERVER_PORT=3000
# CORS_ORIGIN=http://localhost:8000
```

Si necesitas cambiar algo, edita el archivo `.env` con tu editor de texto.

---

### Paso 4️⃣: El Frontend (ya está listo)

El frontend no necesita instalación de dependencias. Solo necesita ser servido a través de un servidor HTTP estático.

```bash
# La carpeta FRONTEND contiene:
# ├── index.html           (Archivo HTML principal)
# ├── css/                 (Estilos CSS)
# ├── js/                  (Código JavaScript)
```

---

## 🚀 Comandos para Iniciar la Aplicación

### Opción 1: Iniciar Backend y Frontend en Terminales Separadas

#### Terminal 1️⃣: Iniciar el Backend

```bash
# Desde la raíz del proyecto
cd BACKEND

# Instalar dependencias (si es la primera vez)
npm install

# Iniciar el servidor backend
npm start

# Deberías ver en la consola:
# Servidor escuchando en http://localhost:3000
# Conexion a MySQL exitosa (personal_management@localhost:3306)
```

**El backend estará disponible en**: `http://localhost:3000`

#### Terminal 2️⃣: Iniciar el Frontend

```bash
# Abre una nueva terminal (en otra ventana)
# Desde la raíz del proyecto
cd FRONTEND

# Opción A: Usando Python 3 (recomendado)
python3 -m http.server 8000

# Opción B: Usando Node.js http-server
npx http-server -p 8000

# Opción C: Usando Python 2 (si lo tienes instalado)
python -m SimpleHTTPServer 8000

# Deberías ver en la consola:
# Serving HTTP on port 8000
```

**El frontend estará disponible en**: `http://localhost:8000`

---

### Opción 2: Usando Scripts de Bash (en macOS/Linux)

Crea un archivo `run-all.sh` en la raíz del proyecto:

```bash
#!/bin/bash

echo "🚀 Iniciando Sistema de Gestión Personal..."

# Iniciar backend en background
cd BACKEND
echo "📦 Iniciando Backend en puerto 3000..."
npm start &
BACKEND_PID=$!

# Dar tiempo al backend para que inicie
sleep 3

# Iniciar frontend en background
cd ../FRONTEND
echo "🎨 Iniciando Frontend en puerto 8000..."
python3 -m http.server 8000 &
FRONTEND_PID=$!

echo ""
echo "✅ Aplicación iniciada correctamente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Frontend:  http://localhost:8000"
echo "⚙️  Backend:   http://localhost:3000"
echo "💾 MySQL:     localhost:3306"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Presiona Ctrl+C para detener la aplicación"

# Esperar a que el usuario presione Ctrl+C
wait
```

Uso:

```bash
# Darle permisos de ejecución
chmod +x run-all.sh

# Ejecutar el script
./run-all.sh
```

---

### Opción 3: Usando Docker (Avanzado)

Si tienes Docker instalado, puedes crear un `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: personal_management
      MYSQL_USER: personal_manager
      MYSQL_PASSWORD: person_123456*
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - ./parametrization/db_relational_model/DB_relational_model.sql:/docker-entrypoint-initdb.d/init.sql

  backend:
    build: ./BACKEND
    ports:
      - "3000:3000"
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql
      DB_USER: personal_manager
      DB_PASSWORD: person_123456*
      DB_NAME: personal_management

  frontend:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./FRONTEND:/app
    ports:
      - "8000:8000"
    command: npx http-server -p 8000
```

Uso:

```bash
docker-compose up
```

---

## ⏹️ Detener los Servidores

### 🛑 Opción 1: Terminales Separadas (Recomendado)

Para detener el **Backend** y **Frontend** si los iniciaste en terminales separadas:

#### Detener Backend

En la **Terminal 1** donde corre el backend:

```bash
# Presiona las siguientes teclas simultáneamente:
Ctrl + C

# Verás un mensaje similar a:
# ^C
# Servidor detenido

# Luego cierra la terminal (opcional)
exit
```

#### Detener Frontend

En la **Terminal 2** donde corre el frontend:

```bash
# Presiona las siguientes teclas simultáneamente:
Ctrl + C

# Verás un mensaje similar a:
# ^C
# Keyboard interrupt received, exiting

# Luego cierra la terminal (opcional)
exit
```

---

### 🛑 Opción 2: Script Único (run-all.sh)

Si usaste el script `run-all.sh`:

```bash
# En la terminal donde ejecutaste el script, presiona:
Ctrl + C

# Esto detendrá tanto el backend como el frontend automáticamente

# El script mostrará:
# Presiona Ctrl+C para detener la aplicación
# ^C
# Deteniendo procesos...
```

---

### 🛑 Opción 3: Docker

Si usaste Docker Compose:

```bash
# En la terminal donde ejecutaste docker-compose up, presiona:
Ctrl + C

# O en otra terminal, ejecuta:
docker-compose down

# Esto detendrá MySQL, Backend y Frontend simultáneamente
```

---

### 🛑 Detener Puertos Específicos (Alternativa)

Si por alguna razón los servidores siguen corriendo:

#### Detener Backend (Puerto 3000)

```bash
# macOS/Linux
lsof -i :3000
# Encontrará el PID (número de proceso)
# Luego mata el proceso
kill -9 PID

# Windows (PowerShell)
netstat -ano | findstr :3000
# Encontrará el PID
taskkill /PID <PID> /F
```

#### Detener Frontend (Puerto 8000)

```bash
# macOS/Linux
lsof -i :8000
# Encontrará el PID
kill -9 PID

# Windows (PowerShell)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

#### Detener MySQL (Puerto 3306)

```bash
# macOS (Homebrew)
brew services stop mysql

# Linux
sudo systemctl stop mysql

# Windows (Services)
# En Services (services.msc) busca MySQL y haz clic en Detener

# O desde terminal:
mysql.server stop  # macOS
sudo service mysql stop  # Linux
```

---

### ✅ Verificar que se Detuvieron

Después de presionar `Ctrl + C`, verifica que los puertos estén libres:

```bash
# Verifica que no hay nada en puerto 3000
lsof -i :3000
# No debería mostrar nada

# Verifica que no hay nada en puerto 8000
lsof -i :8000
# No debería mostrar nada

# Verifica que no hay nada en puerto 3306
lsof -i :3306
# No debería mostrar nada (o solo MySQL)
```

---

### 💡 Tips Útiles

| Problema | Solución |
|----------|----------|
| **Terminal no responde** | Presiona `Ctrl + C` varias veces |
| **Puerto sigue ocupado** | Usa `kill -9 PID` (macOS/Linux) |
| **No puedo cerrar terminal** | Abre una nueva terminal y mata el proceso por PID |
| **Todo congelado** | Cierra todas las terminales y reinicia |

---

## Estructura del Proyecto

```
personal_management/
│
├── 📄 README.md                          (Este archivo)
├── 📄 CLAUDE.md                          (Guía para Claude)
├── 📄 notas_implementacion.md            (Notas del desarrollo)
│
├── 📁 parametrization/
│   ├── db_relational_model/
│   │   └── DB_relational_model.sql       (Script de creación)
│   └── js_clases/                        (Clases de referencia del modelo)
│
├── 📁 BACKEND/                           (Servidor API)
│   ├── src/
│   │   ├── index.js                      (Punto de entrada: arranca el servidor)
│   │   │
│   │   ├── config/                       (Configuración)
│   │   │   ├── app.js                    (Configuración de Express)
│   │   │   ├── database.js               (Pool de MySQL)
│   │   │   └── environment.js            (Variables de entorno)
│   │   │
│   │   ├── models/                       (Clases del dominio)
│   │   │   ├── Usuario.js
│   │   │   ├── Telefono.js
│   │   │   ├── RedSocial.js
│   │   │   └── PerfilSocial.js
│   │   │
│   │   ├── services/                     (Clases: lógica de negocio y SQL)
│   │   │   ├── usuarioService.js
│   │   │   ├── telefonoService.js
│   │   │   ├── redSocialService.js
│   │   │   └── perfilSocialService.js
│   │   │
│   │   ├── controllers/                  (Funciones async: manejan las rutas)
│   │   │   ├── usuarioController.js
│   │   │   ├── telefonoController.js
│   │   │   ├── redSocialController.js
│   │   │   └── perfilSocialController.js
│   │   │
│   │   ├── routes/                       (Definición de endpoints)
│   │   │   ├── usuarioRoutes.js
│   │   │   ├── telefonoRoutes.js
│   │   │   ├── redSocialRoutes.js
│   │   │   ├── perfilSocialRoutes.js
│   │   │   └── index.js
│   │   │
│   │   ├── middleware/                   (Middlewares)
│   │   │   ├── validateInput.js          (Validación de datos)
│   │   │   └── errorHandler.js           (Manejo de errores)
│   │   │
│   │   └── utils/                        (Utilidades)
│   │       ├── helpers.js                (Funciones auxiliares)
│   │       ├── sanitizers.js             (Validación usada por los modelos)
│   │       └── validators.js             (Campos obligatorios en las rutas)
│   │
│   ├── tests/                            (Pruebas automatizadas)
│   ├── package.json                      (Dependencias)
│   ├── .env                              (Variables de entorno)
│   ├── .env.example                      (Plantilla de .env)
│   └── .gitignore
│
└── 📁 FRONTEND/                          (Interfaz de usuario)
    ├── index.html                        (HTML principal)
    │
    ├── css/
    │   ├── tokens.css                    (Variables de diseño)
    │   ├── main.css                      (Estilos generales)
    │   ├── atoms.css                     (Componentes atómicos)
    │   ├── molecules.css                 (Componentes compuestos)
    │   └── organisms.css                 (Componentes complejos)
    │
    └── js/
        ├── config.js                     (Configuración)
        │
        ├── api/                          (Funciones fetch)
        │   ├── usuariosApi.js
        │   ├── telefonosApi.js
        │   ├── redesSocialesApi.js
        │   └── perfilesSocialesApi.js
        │
        ├── utils/
        │   └── dom.js                    (Utilidades DOM)
        │
        ├── organisms/                    (Módulos por entidad)
        │   ├── usuariosOrganism.js
        │   ├── telefonosOrganism.js
        │   ├── redesSocialesOrganism.js
        │   └── perfilesSocialesOrganism.js
        │
        └── main.js                       (Bootstrap)
```

### 🧪 Pruebas automatizadas

```bash
cd BACKEND
npm test
```

- `models.test.js` y `services.test.js` no necesitan base de datos.
- `api.test.js` arranca un servidor MySQL temporal y privado (no toca tu base de datos). Si no encuentra el ejecutable `mysqld`, indícalo con la variable `MYSQLD_PATH`.

---

## Modelo de Datos

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
```
http://localhost:3000/api
```

### 📋 Usuarios

#### Listar todos los usuarios
```bash
GET /api/usuarios
```

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

### 1. Acceder a la Aplicación

Una vez que ambos servidores estén en ejecución, abre tu navegador web en:

```
http://localhost:8000
```

Deberías ver la interfaz principal con 4 pestañas en el header.

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

### Frontend

| Tecnología | Propósito |
|-----------|----------|
| **HTML5** | Estructura del documento |
| **CSS3** | Estilos y diseño responsivo |
| **JavaScript ES6+** | Lógica de la aplicación |
| **Fetch API** | Comunicación con el backend |
| **Atomic Design** | Metodología de componentes |

### Base de Datos

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **MySQL** | 5.7+ | Sistema gestor de base de datos |
| **SQL** | Estándar | Lenguaje de consultas |

---

## 🎓 Conceptos Educativos Abordados

Este proyecto enseña los siguientes conceptos de desarrollo web:

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
- Códigos de estado HTTP (200, 201, 400, 404, 409)
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

## 📝 Solución de Problemas Comunes

### Error: "Connection refused" en el backend

**Problema**: El backend no puede conectar a MySQL.

**Soluciones**:
1. Verifica que MySQL está running: `brew services start mysql` (macOS)
2. Verifica las credenciales en `.env`
3. Verifica que la base de datos existe: `mysql -u root -p` → `SHOW DATABASES;`

### Error: "CORS error" en el navegador

**Problema**: El frontend no puede acceder al backend.

**Soluciones**:
1. Verifica que el backend está running en puerto 3000
2. Verifica que `CORS_ORIGIN` en `.env` es correcto
3. Reinicia ambos servidores

### Error: "Port already in use"

**Problema**: El puerto 3000 u 8000 ya está siendo usado.

**Soluciones**:

```bash
# Encontrar qué proceso usa el puerto 3000
lsof -i :3000

# Matar el proceso
kill -9 <PID>

# O cambia el puerto en .env (SERVER_PORT)
```

### Los datos no aparecen en las tablas

**Problema**: La tabla está vacía después de crear un registro.

**Soluciones**:
1. Abre la consola del navegador (F12) y revisa si hay errores
2. Verifica en MySQL si el registro fue insertado: `SELECT * FROM USUARIO;`
3. Reinicia el backend y frontend

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

Para confirmar que todo está funcionando correctamente:

```bash
# 1. Verifica que MySQL está running
mysql -u personal_manager -p personal_management -e "SHOW TABLES;"

# 2. Verifica que el backend responde
curl http://localhost:3000/

# 3. Verifica que el frontend carga
curl http://localhost:8000/index.html

# 4. Prueba un endpoint de la API
curl http://localhost:3000/api/usuarios
```

---

## 🎯 Conclusión

¡Felicidades! Ahora tienes una aplicación web completa y funcional. 

Este proyecto te ha permitido aprender:
- ✅ Arquitectura backend en capas
- ✅ Desarrollo de APIs REST
- ✅ Manipulación del DOM con JavaScript puro
- ✅ Diseño responsivo con CSS3
- ✅ Gestión de bases de datos relacionales

Ahora puedes:
- 🚀 Desplegar la aplicación en un servidor
- 🔒 Agregar autenticación y autorización
- 📊 Implementar paginación y filtros
- 🎨 Mejorar el diseño de la interfaz
- 📱 Hacer la app responsive en móviles

---

**Autor**: SENA - Programa de Formación  
**Fecha**: Septiembre 2026  
**Tecnologías**: Node.js, Express, MySQL, JavaScript, HTML5, CSS3

---

¿Tienes preguntas? Revisa el archivo `CLAUDE.md` para más detalles técnicos.
