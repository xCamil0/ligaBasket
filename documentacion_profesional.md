# DOCUMENTACIÓN TÉCNICA Y DE USUARIO
## SISTEMA DE GESTIÓN DE LIGA DE BALONCESTO — NEXTGEN LEAGUE

---

## 1. Portada

### **Proyecto:** NextGen League — Sistema de Gestión de Liga de Baloncesto
### **Versión:** 1.0.0
### **Fecha:** 3 de Julio de 2026
### **Autor:** Camilo Lamprea (Desarrollador Principal)
### **Estado del Proyecto:** Producción / Estable

## 2. Tabla de contenido

1. [Portada](#1-portada)
2. [Tabla de contenido](#2-tabla-de-contenido)
3. [Introducción](#3-introduccion)
4. [Objetivos](#4-objetivos)
5. [Tecnologías utilizadas](#5-tecnologias-utilizadas)
6. [Arquitectura del Sistema](#6-arquitectura)
7. [Estructura del proyecto](#7-estructura-del-proyecto)
8. [Base de datos](#8-base-de-datos)
9. [Funcionalidades del Sistema](#9-funcionalidades)
10. [API (Endpoints del Backend)](#10-api)
11. [Seguridad](#11-seguridad)
12. [Manual de usuario](#12-manual-de-usuario)
13. [Manual técnico](#13-manual-tecnico)
14. [Conclusiones](#14-conclusiones)
15. [Referencias](#15-referencias)

---

## 3. Introducción

**NextGen League** es una plataforma web integral diseñada para la gestión, organización y visualización de ligas de baloncesto amateur o profesionales. El sistema permite automatizar procesos administrativos complejos como la creación de temporadas, la gestión de equipos (incluyendo fichajes y liberación de jugadores), la programación manual de partidos y la generación automática de fixtures mediante algoritmos matemáticos de programación deportiva. 

Desde la perspectiva del usuario general, la plataforma proporciona un portal público interactivo donde es posible seguir en tiempo real la tabla de posiciones clasificada de los equipos, el ranking de anotadores individuales (Pichichi), el fixture de encuentros detallados por jornadas, y estadísticas detalladas tanto a nivel de equipo como de partido individual. Desde la perspectiva del administrador, el portal cuenta con un panel seguro protegido mediante JWT (JSON Web Tokens) que centraliza el CRUD completo de toda la liga.

---

## 4. Objetivos

### Objetivo general
Proporcionar una solución digital robusta y unificada para automatizar y administrar las operaciones de una liga de baloncesto, ofreciendo un portal de consulta pública interactivo y un panel de administración restringido y seguro para la toma de decisiones técnicas.

### Objetivos específicos
* **Automatización del Calendario:** Implementar un motor Round-Robin para autogenerar fixtures deportivos de ida y vuelta a partir de una lista de equipos y fechas.
* **Control de Plantillas y Fichajes:** Registrar jugadores clasificándolos por categorías y regularizando su vinculación con los equipos mediante un historial de fichajes auditable y controlando que no queden equipos sin integrantes activos.
* **Estadísticas Dinámicas:** Calcular en tiempo real la tabla de posiciones general (Puntos, Partidos Jugados, Ganados, Perdidos, Diferencia de Puntos) y el ranking de máximos anotadores (Pichichi) por temporada a partir de las actas de finalización de partidos.
* **Seguridad y Control de Acceso:** Resguardar las operaciones de modificación de datos del servidor por medio de autenticación JWT y validación estricta de conflictos de negocio (horarios repetidos, estadios duplicados, nombres repetidos, etc.).

---

## 5. Tecnologías utilizadas

El proyecto está construido bajo una pila de desarrollo moderna, escalable y desacoplada, utilizando tecnologías de alto rendimiento:

### Backend
1. **Node.js & Express:** Entorno de ejecución en servidor y framework web para construir la API REST. Express facilita el enrutamiento y la inclusión de middlewares.
2. **PostgreSQL (`pg`):** Base de datos relacional robusta que garantiza la integridad referencial y permite realizar consultas complejas analíticas (como el cálculo en tiempo real de la tabla de posiciones con sentencias `WITH` y `FILTER`).
3. **jsonwebtoken (JWT):** Estándar industrial utilizado para asegurar y verificar la identidad de los administradores mediante tokens firmados que expiran en 2 horas.
4. **bcryptjs:** Librería de hashing seguro para cifrar las contraseñas de los administradores en la base de datos.
5. **multer:** Middleware para la gestión y almacenamiento local de archivos subidos en peticiones HTTP del tipo `multipart/form-data` (usado para subir logos de equipos).
6. **dotenv:** Carga de variables de entorno críticas desde el archivo `.env`.

### Frontend
1. **React 19:** Biblioteca JavaScript moderna basada en componentes reutilizables con un flujo de datos unidireccional para construir interfaces de usuario rápidas.
2. **Vite 8:** Herramienta de compilación ultra rápida que optimiza el entorno de desarrollo mediante módulos ES nativos (HMR) y empaqueta el código final para producción de forma óptima.
3. **React Router DOM 7:** Manejo de rutas del lado del cliente en aplicaciones SPA (Single Page Application).
4. **Axios:** Cliente HTTP basado en promesas para consumir la API de forma simplificada.
5. **TailwindCSS 4 & PostCSS:** Framework CSS utilitario y procesador que permite estructurar un diseño responsive, moderno y con soporte de variables de diseño complejas.
6. **Lucide React:** Colección de iconos en formato vectorial SVG listos para usar en React.

---

## 6. Arquitectura

El sistema de NextGen League implementa una **Arquitectura Cliente-Servidor Desacoplada**:

```
+-------------------------------------------------------------+
|                       CAPA CLIENTE                          |
|  React SPA (Vite)                                           |
|  - consume endpoints HTTP (Axios)                           |
|  - guarda JWT en LocalStorage                               |
+------------------------------+------------------------------+
                               |
                        Peticiones HTTP
                               |
                               v
+------------------------------+------------------------------+
|                      CAPA SERVIDOR                          |
|  API REST Express (Node.js)                                 |
|  - Middlewares: Auth (JWT), Validation, Multer              |
|  - Controladores de Negocio                                 |
+------------------------------+------------------------------+
                               |
                          Consultas SQL
                               |
                               v
+------------------------------+------------------------------+
|                     CAPA BASE DE DATOS                      |
|  PostgreSQL                                                 |
|  - 8 Tablas relacionadas                                    |
|  - Restricciones FK, PK, Triggers e Índices implicados      |
+-------------------------------------------------------------+
```

---

## 7. Estructura del proyecto

El proyecto está dividido en dos grandes directorios independientes para el backend y el frontend:

### Backend
* `backend/`
  * `src/`
    * `config/`
      * `db.js` — Pool de conexiones a PostgreSQL
    * `controllers/`
      * `authController.js` — CRUD de administradores y login
      * `calendarioController.js` — Algoritmo Round-Robin para fixtures
      * `equipoController.js` — Lógica de equipos y fichajes
      * `jugadorController.js` — Lógica de jugadores y trayectorias
      * `partidoController.js` — Programación, edición y finalización de partidos
      * `statsController.js` — Estadísticas del Pichichi
      * `tablaController.js` — Cálculo de la tabla de clasificación
      * `temporadasController.js` — Gestión de temporadas y asignación de equipos
    * `middlewares/`
      * `authMiddlewares.js` — Verificación de JWT
      * `validaciones.js` — Validaciones de tipos y campos obligatorios
      * `verificarTemporadaFinalizada.js` — Bloqueo de modificaciones en temporadas finalizadas
    * `routes/`
      * `authRoutes.js` — Enrutamiento de `/api/auth`
      * `calendarioRoutes.js` — Enrutamiento de `/api/calendario`
      * `equipoRoutes.js` — Enrutamiento de `/api/equipos`
      * `jugadorRoutes.js` — Enrutamiento de `/api/jugadores`
      * `partidoRoutes.js` — Enrutamiento de `/api/partidos`
      * `statsRoutes.js` — Enrutamiento de `/api/stats`
      * `tablaRoutes.js` — Enrutamiento de `/api/tabla`
      * `temporadasRoutes.js` — Enrutamiento de `/api/temporadas`
    * `server.js` — Punto de entrada, Express e inicialización de port
  * `uploads/` — Directorio de almacenamiento de imágenes (logos)
  * `package.json` — Dependencias y scripts de ejecución

### Frontend
* `frontend/`
  * `public/` — Recursos estáticos públicos del navegador
  * `src/`
    * `api/`
      * `axios.js` — Instancia de Axios apuntando al backend
    * `components/`
      * `Footer/`
        * `Footer.jsx` — Pie de página de la liga
      * `ModoColor/`
        * `modoColor.jsx` — Selector flotante de tema Claro/Oscuro
      * `navbar/`
        * `navbar.jsx` — Menú de navegación responsive (Escritorio/Móvil)
      * `pages/`
        * `Admin/`
          * `Admin.jsx` — Panel completo de administración (Vistas integradas)
        * `detalleEquipo/`
          * `detalleEquipo.jsx` — Ficha del equipo (Plantilla, partidos, stats)
        * `detallePartido/`
          * `DetallePartido.jsx` — Acta del partido (Alineaciones, estadísticas, tabla)
        * `equipos/`
          * `equipos.jsx` — Catálogo de equipos con filtros de temporada
        * `inicio/`
          * `Home.jsx` — Landing principal y Scoreboard
          * `Tabla.jsx` — Clasificación de posiciones
          * `scoreboard.jsx` — Marcador horizontal interactivo
        * `jugadores/`
          * `Jugadores.jsx` — Grid de jugadores con trayectoria y puntos
        * `login/`
          * `login.jsx` — Modal de inicio de sesión administrativo
        * `pichichi/`
          * `pichichi.jsx` — Top de máximos anotadores
    * `App.jsx` — Configuración de rutas de React Router y providers
    * `main.jsx` — Renderizador principal del DOM de React
  * `package.json` — Dependencias y scripts del frontend

---

## 8. Base de datos

El sistema utiliza **PostgreSQL**. A continuación se detalla el esquema lógico e integridad referencial reconstruido a partir del código de los controladores:

### Tablas de la Base de Datos

1. **`usuarios` (Administradores):**
   * Propósito: Almacena las credenciales de los administradores facultados para realizar cambios.
   * Columnas:
     * `id` (SERIAL, Primary Key): Identificador único auto-incrementado.
     * `username` (VARCHAR(100), UNIQUE): Nombre de usuario del admin.
     * `password` (VARCHAR(255)): Contraseña cifrada mediante bcrypt.
     * `Email` (VARCHAR(150)): Dirección de correo electrónico.
2. **`temporadas`:**
   * Propósito: Registra las temporadas deportivas y sus fechas límites de vigencia.
   * Columnas:
     * `id` (SERIAL, Primary Key): Identificador único de temporada.
     * `nombre` (VARCHAR(100), UNIQUE): Nombre descriptivo (ej: "Liga de Verano 2026").
     * `fecha_inicio` (DATE): Fecha en que comienza la temporada (validación de duración >= 5 meses).
     * `fecha_fin` (DATE): Fecha en que finaliza la temporada.
     * `actual` (BOOLEAN): Estado de activación general (`true` para indicar la temporada activa).
     * `finalizada` (BOOLEAN, default false): Indica si la temporada ha sido cerrada oficialmente. Cuando es `true`, el middleware `verificarTemporadaFinalizada` bloquea cualquier operación de escritura asociada a esa temporada (partidos, fixtures, fichajes, asignación de equipos).
3. **`equipos`:**
   * Propósito: Registra los clubes que participan en la liga.
   * Columnas:
     * `id` (SERIAL, Primary Key): Identificador único del equipo.
     * `nombre` (VARCHAR(100)): Nombre único del club.
     * `logo` (VARCHAR(255), Nullable): Ruta relativa del archivo de imagen (ej. `/uploads/171294819.png`).
     * `entrenador` (VARCHAR(100)): Nombre del director técnico a cargo (debe ser único entre equipos activos).
     * `estadio` (VARCHAR(100)): Estadio sede (debe ser único entre equipos activos).
     * `activo` (BOOLEAN, default true): Campo de control para dar de baja equipos (soft delete).
4. **`temporada_equipos`:**
   * Propósito: Relación N a N que inscribe equipos en temporadas y almacena sus puntos acumulados.
   * Columnas:
     * `temporada_id` (INT, FK -> `temporadas(id)`): Identificador de la temporada.
     * `equipo_id` (INT, FK -> `equipos(id)`): Identificador del equipo.
     * `puntos_totales` (INT, default 0): Puntos acumulados en la clasificación general.
     * *Restricción:* Llave Primaria compuesta por `(temporada_id, equipo_id)`.
5. **`jugadores`:**
   * Propósito: Datos maestros de los jugadores.
   * Columnas:
     * `id` (SERIAL, Primary Key): Identificador del jugador.
     * `nombre_apellido` (VARCHAR(150), UNIQUE): Nombre del basquetbolista.
     * `categoria` (VARCHAR(50)): Categoría (ej: "Juvenil", "Mayores").
     * `equipo_id` (INT, FK -> `equipos(id)`, Nullable): Club actual (NULL si es Agente Libre).
     * `dorsal` (INT, Nullable): Número de camiseta (único en el mismo equipo).
6. **`historial_fichajes`:**
   * Propósito: Bitácora auditable de traspasos de jugadores.
   * Columnas:
     * `id` (SERIAL, Primary Key): Identificador de registro.
     * `jugador_id` (INT, FK -> `jugadores(id)`): Identificador del jugador.
     * `equipo_id` (INT, FK -> `equipos(id)`, Nullable): Club receptor (NULL para indicar rescisión/agente libre).
     * `temporada_id` (INT, FK -> `temporadas(id)`): Temporada del traspaso.
     * `es_actual` (BOOLEAN): Indica si representa el estado vigente del jugador.
     * `fecha_fichaje` (TIMESTAMP, default now()): Fecha y hora del registro.
7. **`partidos`:**
   * Propósito: Registro de encuentros de la liga.
   * Columnas:
     * `id` (SERIAL, Primary Key): Identificador de partido.
     * `id_equipo_local` (INT, FK -> `equipos(id)`): Club anfitrión.
     * `id_equipo_visitante` (INT, FK -> `equipos(id)`): Club visitante.
     * `fecha` (DATE): Día programado del partido.
     * `horario` (TIME): Hora del pitazo inicial.
     * `lugar` (VARCHAR(255)): Estadio del partido (por defecto el del equipo local).
     * `temporada_id` (INT, FK -> `temporadas(id)`): Temporada del encuentro.
     * `jornada` (INT, Nullable): Jornada o fecha deportiva.
     * `finalizado` (BOOLEAN, default false): Estado del partido (`true` al registrar marcador).
     * `puntos_local` (INT, Nullable): Puntos del equipo local.
     * `puntos_visitante` (INT, Nullable): Puntos del equipo visitante.
8. **`anotaciones`:**
   * Propósito: Registro de anotaciones individuales de encestadores por cada partido.
   * Columnas:
     * `id_partido` (INT, FK -> `partidos(id)`): Partido jugado.
     * `id_jugador` (INT, FK -> `jugadores(id)`): Jugador que anotó.
     * `temporada_id` (INT, FK -> `temporadas(id)`): Temporada asociada (para optimización del ranking).
     * `puntos_anotados` (INT): Puntos anotados por el jugador.
     * *Restricción:* Llave Primaria compuesta por `(id_partido, id_jugador)`.

### Sentencias SQL de Creación (DDL)

```sql
-- 1. Tabla de Usuarios Administradores
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    Email VARCHAR(150) NOT NULL
);

-- 2. Tabla de Temporadas
CREATE TABLE temporadas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    actual BOOLEAN DEFAULT false,
    finalizada BOOLEAN DEFAULT false
);

-- Seed temporada por defecto (Esencial para el sistema)
INSERT INTO temporadas (id, nombre, fecha_inicio, fecha_fin, actual) 
VALUES (1, 'Amistosos / Prácticas', '2000-01-01', '2100-12-31', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Tabla de Equipos
CREATE TABLE equipos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    logo VARCHAR(255),
    entrenador VARCHAR(100) NOT NULL,
    estadio VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true
);

-- 4. Tabla de Asociación de Equipos y Temporadas (Standings Puntos)
CREATE TABLE temporada_equipos (
    temporada_id INT REFERENCES temporadas(id) ON DELETE CASCADE,
    equipo_id INT REFERENCES equipos(id) ON DELETE CASCADE,
    puntos_totales INT DEFAULT 0,
    PRIMARY KEY (temporada_id, equipo_id)
);

-- 5. Tabla de Jugadores
CREATE TABLE jugadores (
    id SERIAL PRIMARY KEY,
    nombre_apellido VARCHAR(150) UNIQUE NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    equipo_id INT REFERENCES equipos(id) ON DELETE SET NULL,
    dorsal INT
);

-- 6. Tabla de Historial de Fichajes
CREATE TABLE historial_fichajes (
    id SERIAL PRIMARY KEY,
    jugador_id INT REFERENCES jugadores(id) ON DELETE CASCADE,
    equipo_id INT REFERENCES equipos(id) ON DELETE SET NULL,
    temporada_id INT REFERENCES temporadas(id) ON DELETE CASCADE,
    es_actual BOOLEAN DEFAULT true,
    fecha_fichaje TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Partidos
CREATE TABLE partidos (
    id SERIAL PRIMARY KEY,
    id_equipo_local INT REFERENCES equipos(id) ON DELETE CASCADE,
    id_equipo_visitante INT REFERENCES equipos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    horario TIME NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    temporada_id INT REFERENCES temporadas(id) ON DELETE CASCADE,
    jornada INT,
    finalizado BOOLEAN DEFAULT false,
    puntos_local INT,
    puntos_visitante INT
);

-- 8. Tabla de Anotaciones de Jugadores por Partido (Pichichi)
CREATE TABLE anotaciones (
    id_partido INT REFERENCES partidos(id) ON DELETE CASCADE,
    id_jugador INT REFERENCES jugadores(id) ON DELETE CASCADE,
    temporada_id INT REFERENCES temporadas(id) ON DELETE CASCADE,
    puntos_anotados INT NOT NULL,
    PRIMARY KEY (id_partido, id_jugador)
);
```

---

## 9. Funcionalidades

El portal web de NextGen League consta de las siguientes páginas e interfaces reales:

### A. Portal Público

1. **Inicio (`/`):**
   * **Scoreboard:** Carrusel horizontal de partidos. Trae partidos pendientes (futuros) de la API `/api/partidos` y, si no hay, muestra los últimos 10 jugados. Permite acceder al detalle haciendo clic.
   * **Hero Principal:** Presentación visual con enlace a catálogo de equipos.
   * **Tabla de Posiciones (`Standings`):** Filtra por temporada consumiendo `/api/tabla?temporada_id=X`. Si es la temporada con ID 1, muestra un mensaje informando que es una temporada de amistosos y que no calcula standings. De lo contrario, renderiza la clasificación (PJ, G, P, PF, PC, DP, PTS) ordenando por PTS desc.
   * **Banner Promocional:** Enlace directo al calendario de partidos.

2. **Equipos (`/equipos`):**
   * Muestra un catálogo con todos los equipos cargados. Permite filtrar dinámicamente mediante un panel lateral de temporadas. Consume `/api/equipos` (si muestra todos) o `/api/equipos/por-temporada?temporada_id=X`.

3. **Detalle del Equipo (`/equipos/:id/detalle`):**
   * Muestra información de perfil del equipo (Entrenador, Estadio y Logo).
   * Presenta estadísticas de partidos jugados/pendientes.
   * Contiene tres pestañas:
     * *Plantilla:* Lista todos los jugadores activos en el equipo con sus dorsales.
     * *Partidos:* Divide los partidos del equipo en jugados y pendientes con marcadores.
     * *Estadísticas:* Información descriptiva de rendimiento.

4. **Pichichi (`/pichichi`):**
   * Tabla con el Top 10 de máximos encestadores de la liga para la temporada elegida. Consume `/api/stats/pichichi?temporada_id=X`.

5. **Partidos (`/partidos`):**
   * Muestra la programación completa de partidos con filtros por temporada y jornadas específicas.
   * Permite realizar una búsqueda textual por nombre de equipo y redirige al detalle.

6. **Detalle del Partido (`/partido/:id`):**
   * Acta detallada del encuentro. Muestra logos, nombres y puntajes finales de los equipos.
   * Pestañas interactivas:
     * *Alineaciones:* Muestra la lista de jugadores de cada equipo con sus dorsales e indica cuántos puntos anotó cada uno en el partido.
     * *Estadísticas:* Gráficas comparativas de rendimiento (Puntos anotados, puntos en la tabla general, partidos ganados/perdidos y win-rate).
     * *Posiciones:* Fila de la tabla comparativa con las posiciones relativas de ambos equipos.

7. **Jugadores (`/jugadores`):**
   * Lista completa de jugadores con buscador de nombres.
   * Cada jugador se visualiza en una tarjeta con su equipo actual, su dorsal, y los puntos anotados desglosados por temporada, así como su historial de trayectoria (fichajes).

### B. Módulo de Autenticación y Administración

1. **Login (Modal):**
   * Superposición interactiva para administradores. Envía credenciales al backend (`/api/auth/login`) y guarda el JWT devuelto en el `LocalStorage` del navegador junto al nombre de usuario.

2. **Dashboard de Administración (`/admin`):**
   * Restringido mediante JWT. Consta de 5 pestañas de gestión en caliente:
     * **Temporadas:** Permite crear y actualizar temporadas (validando duración min. 5 meses), definir cuál es la temporada activa y asignar o remover equipos a cada una de ellas de forma masiva. Incluye la funcionalidad de **Finalizar Temporada**, que muestra un modal de confirmación con el resumen de pendientes (partidos sin jugar, partidos sin marcador, equipos inscritos) antes de cerrar oficialmente la temporada. Las temporadas finalizadas muestran un badge ` Finalizada` y todos sus formularios de edición, asignación de equipos, generación de fixture y fichajes quedan deshabilitados (modo solo lectura). También permite **Reabrir Temporada** para revertir el bloqueo cuando sea necesario. Las temporadas finalizadas pueden ser eliminadas.
     * **Admins:** Permite registrar nuevos administradores en la liga y actualizar o eliminar credenciales de otros (bloquea la auto-eliminación y protege al usuario administrativo por defecto con ID 2).
     * **Equipos:** CRUD de equipos deportivos. Permite registrar equipo asignándole nombre, entrenador, estadio y logotipo (vía formulario con subida de imagen), editar los datos y dar de baja (desactivar) a un equipo.
     * **Jugadores:** Registrar nuevos jugadores con validación de dorsal único en su equipo y nombre único en la liga. Permite realizar fichajes o liberar jugadores traspasándolos al listado de "Agentes Libres". En el selector de temporadas del formulario de fichajes, las temporadas finalizadas aparecen deshabilitadas con el indicador `( Finalizada)`.
     * **Partidos:** Programar partidos en la liga de forma manual verificando que no existan colisiones de fechas o estadios. Cuenta con las opciones de **Generar Calendario** (motor Round-Robin automatizado para la temporada) y **Eliminar Todos los Partidos** de una temporada. Permite además **Finalizar Partido** abriendo una ventana interactiva donde se ingresa el score final del partido y los puntos de cada jugador en la alineación, validando estrictamente que la sumatoria de puntos individuales coincida exactamente con el marcador final del partido. Si la temporada del filtro está finalizada, se muestra un banner de advertencia y se deshabilitan los botones de crear, editar, eliminar y finalizar partidos, mostrando un indicador ` Solo lectura` en cada fila.

---

## 10. API

A continuación se detalla formalmente cada endpoint del Backend:

### A. Autenticación y Administradores (`/api/auth`)

#### `POST /api/auth/login`
* **Descripción:** Compara nombre de usuario y contraseña en texto plano contra la base de datos (usando bcryptjs) y expide un JWT de 2 horas de duración si son válidos.
* **Body:**
  ```json
  {
    "username": "admin",
    "password": "123"
  }
  ```
* **Respuesta Exitosa (200):**
  ```json
  {
    "mensaje": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1...",
    "username": "admin"
  }
  ```
* **Respuesta Error (401):** `{ "error": "Usuario o contraseña incorrectos" }`

#### `POST /api/auth/register`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Registra un nuevo usuario administrador.
* **Body:**
  ```json
  {
    "username": "nuevoAdmin",
    "password": "passwordSeguro",
    "Email": "admin@liga.com"
  }
  ```
* **Respuesta Exitosa (201):** `{ "mensaje": "Registro exitoso", "usuario": { "id": 3, "username": "nuevoAdmin", "Email": "admin@liga.com" } }`
* **Respuesta Error (400):** `{ "error": "El nombre de usuario ya está en uso" }`

#### `GET /api/auth/admin`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Devuelve la lista completa de usuarios con privilegios.
* **Respuesta (200):** Array con los datos de todos los administradores.

#### `PUT /api/auth/admin/:id`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Actualiza los campos de un administrador. Bloquea si el ID es 2.
* **Body:** `{ "username": "adminAct", "password": "newPassword", "Email": "nuevo@mail.com" }`
* **Respuesta (200):** `{ "mensaje": "Usuario actualizado", "usuario": { ... } }`

#### `DELETE /api/auth/admin/:id`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Elimina un administrador (protege al ID 2 y al usuario de la sesión actual contra la auto-eliminación).
* **Respuesta (200):** `{ "mensaje": "Usuario eliminado correctamente" }`

---

### B. Temporadas (`/api/temporadas`)

#### `GET /api/temporadas`
* **Descripción:** Lista las temporadas deportivas registradas.
* **Respuesta (200):** Array de temporadas ordenadas por fecha de inicio desc.

#### `POST /api/temporadas`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Registra una nueva temporada. Valida duración mínima de 150 días (5 meses) y nombre único.
* **Body:**
  ```json
  {
    "nombre": "Liga 2026",
    "fecha_inicio": "2026-02-01",
    "fecha_fin": "2026-07-15"
  }
  ```
* **Respuesta (201):** Objeto de la temporada creada.

#### `PUT /api/temporadas/actual/:id`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Activa una temporada y desactiva las demás de forma atómica en una transacción.
* **Respuesta (200):** `{ "mensaje": "Temporada actual actualizada", "temporada": { ... } }`

#### `POST /api/temporadas/equipos`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Vincula masivamente un array de IDs de equipos a una temporada.
* **Body:**
  ```json
  {
    "temporada_id": 2,
    "equipos_ids": [1, 2, 3, 4]
  }
  ```
* **Respuesta (200):** `{ "mensaje": "4 equipos asignados correctamente a la temporada." }`
* **Restricción:** Bloqueado por el middleware `verificarTemporadaFinalizada` si la temporada asociada está finalizada (403 Forbidden).

#### `PUT /api/temporadas/:id`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Actualiza el nombre y las fechas de una temporada existente.
* **Restricción:** Bloqueado por el middleware `verificarTemporadaFinalizada` si la temporada está finalizada.
* **Body:** `{ "nombre": "Liga Actualizada", "fecha_inicio": "2026-03-01", "fecha_fin": "2026-08-15" }`
* **Respuesta (200):** Objeto de la temporada actualizada.

#### `DELETE /api/temporadas/:id`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Elimina una temporada y todos sus datos asociados (partidos, anotaciones, equipos asignados) en cascada. **No está bloqueado por el middleware de temporada finalizada**, ya que las temporadas finalizadas sí pueden eliminarse.
* **Respuesta (200):** `{ "mensaje": "Temporada eliminada correctamente" }`

#### `GET /api/temporadas/:id/resumen`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Obtiene un resumen estadístico de la temporada para mostrar antes de finalizarla. Devuelve la cantidad de partidos totales, partidos sin jugar, partidos jugados sin marcador cargado y equipos inscritos.
* **Respuesta (200):**
  ```json
  {
    "nombre": "Liga 2026",
    "total_partidos": 30,
    "partidos_sin_jugar": 5,
    "partidos_sin_resultado": 2,
    "equipos_inscritos": 8
  }
  ```

#### `PUT /api/temporadas/:id/finalizar`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Marca la temporada como finalizada (`finalizada = true`). A partir de ese momento, el middleware `verificarTemporadaFinalizada` bloqueará toda operación de escritura asociada a esa temporada.
* **Respuesta (200):** `{ "mensaje": "Temporada finalizada correctamente" }`

#### `PUT /api/temporadas/:id/reabrir`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Reabre una temporada previamente finalizada (`finalizada = false`), habilitando nuevamente la edición de sus datos asociados.
* **Respuesta (200):** `{ "mensaje": "Temporada reabierta correctamente" }`

---

### C. Equipos (`/api/equipos`)

#### `GET /api/equipos`
* **Descripción:** Obtiene los equipos con estado activo.

#### `GET /api/equipos/por-temporada`
* **Descripción:** Obtiene los equipos activos que participan en una temporada dada.
* **Parámetros Query:** `?temporada_id=X`

#### `POST /api/equipos`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>` y tipo `multipart/form-data`.
* **Descripción:** Crea un equipo (con carga de logo) y lo inscribe en la temporada enviada y adicionalmente en la de amistosos (ID 1). Valida que el nombre de equipo sea único, y que entrenador y estadio no estén asignados a otro equipo activo.
* **Multipart Body:** `nombre`, `entrenador`, `estadio`, `temporada_id`, `foto` (archivo).
* **Respuesta (211):** `{ "mensaje": "Equipo creado y asignado exitosamente", "equipoId": 4 }`

#### `DELETE /api/equipos/:id`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Soft delete del equipo (`activo = false`), elimina sus partidos programados futuros (no jugados), remueve su inscripción en la temporada actual y libera a toda su plantilla de jugadores convirtiéndolos en Agentes Libres de forma atómica en una transacción.
* **Respuesta (200):** `{ "mensaje": "El equipo X ha sido desactivado. Se han eliminado sus partidos programados y sus jugadores han quedado libres." }`

---

### D. Jugadores (`/api/jugadores`)

#### `GET /api/jugadores`
* **Descripción:** Obtiene todos los jugadores consolidados con su equipo actual, su histórico de puntos por temporada y su trayectoria de fichajes.

#### `POST /api/jugadores`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Crea un jugador. Valida nombre de jugador único a nivel de liga y número de dorsal único dentro de su equipo.
* **Body:**
  ```json
  {
    "nombre_apellido": "Carlos Delfino",
    "categoria": "Mayores",
    "equipo_id": 2,
    "dorsal": 10
  }
  ```
* **Respuesta (201):** Objeto del jugador registrado.

---

### E. Partidos (`/api/partidos`)

#### `GET /api/partidos`
* **Descripción:** Devuelve los partidos del calendario. Soporta filtros opcionales de query: `?temporada_id=X&jornada=Y`. Auto-finaliza partidos cuya fecha sea anterior a la de hoy.

#### `POST /api/partidos`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Agenda manualmente un partido de baloncesto. Valida:
  * El equipo local y visitante no pueden ser el mismo.
  * Ambos equipos deben tener al menos un jugador en su plantilla.
  * Ninguno de los dos equipos puede tener otro partido programado para ese mismo día.
  * La fecha del partido debe estar dentro del rango de inicio/fin de la temporada elegida.
  * Ambos equipos deben estar asignados previamente a esa temporada.
  * No puede haber conflicto de horarios para el mismo día y hora para ninguno de los equipos.
* **Body:**
  ```json
  {
    "id_equipo_local": 1,
    "id_equipo_visitante": 2,
    "fecha": "2026-08-10",
    "horario": "18:30:00",
    "temporada_id": 2,
    "jornada": 3,
    "lugar": "Coliseo Mayor"
  }
  ```

#### `PUT /api/partidos/:id/finalizar`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Finaliza un encuentro deportivo registrando el marcador y las estadísticas individuales del Pichichi en una transacción atómica. Valida:
  * No se admiten empates en el marcador final.
  * Los puntos de ambos equipos deben ser mayores a cero.
  * La sumatoria de puntos individuales de los jugadores provistos en las anotaciones debe coincidir exactamente con el puntaje total del marcador para cada equipo.
  * Incrementa en +3 los puntos del ganador en la tabla `temporada_equipos`.
* **Body:**
  ```json
  {
    "puntos_local": 90,
    "puntos_visitante": 82,
    "anotaciones": [
      { "jugador_id": 4, "puntos": 30 },
      { "jugador_id": 8, "puntos": 60 },
      { "jugador_id": 12, "puntos": 82 }
    ]
  }
  ```
* **Respuesta (200):** `{ "mensaje": "Partido y estadísticas de jugadores guardados", "partido": { ... } }`

---

### F. Calendarios (`/api/calendario`)

#### `POST /api/calendario/generar`
* **Filtro:** Requiere cabecera `Authorization: Bearer <TOKEN>`.
* **Descripción:** Genera de forma automática un calendario deportivo Round-Robin de Ida y Vuelta en una transacción atómica. Valida:
  * La temporada debe existir y contar con un rango de fechas válido.
  * Debe haber al menos 2 equipos inscritos en la temporada.
  * La cantidad de equipos inscritos debe ser par.
  * Todos los equipos asignados a la temporada deben tener al menos un jugador registrado.
  * Calcula de forma automática el intervalo de días óptimo para distribuir uniformemente los encuentros de Ida y de Vuelta. Los partidos de Ida se programan en la primera mitad del torneo y los de Vuelta en la segunda mitad (con localía invertida).
* **Body:** `{ "temporada_id": 2 }`
* **Respuesta (200):** `{ "mensaje": "Calendario de X jornadas (ida y vuelta) generado del DD/MM/AAAA al DD/MM/AAAA" }`

---

## 11. Seguridad

La seguridad está implementada en base a buenas prácticas estándar:

1. **Autenticación Basada en Tokens (JWT):** Las credenciales administrativas no viajan en cada petición. El login genera un token JWT firmado digitalmente mediante `jsonwebtoken` usando un secreto almacenado en variables de entorno (`JWT_SECRET`). Este token expira tras 2 horas de inactividad.
2. **Encriptación Irreversible:** Las contraseñas en la tabla `usuarios` están hasheadas con `bcryptjs` (salt de 10 pasadas), impidiendo leer las contraseñas reales ante posibles fugas del motor.
3. **Protección en la API (Acceso de Escritura Restringido):** Todas las solicitudes de manipulación de datos (`POST`, `PUT`, `DELETE`) en la API pasan por el middleware `verificarToken`. Si la cabecera `Authorization` no contiene un Bearer Token válido, la API corta el flujo devolviendo un error 403 (Acceso denegado) o 401 (Token no válido).
4. **Validaciones de Integridad y Lógica de Negocio:**
   * **Cero Empates:** Al finalizar partidos se rechazan empates mediante código para ajustarse estrictamente a la normativa FIBA de baloncesto.
   * **Protección del Administrador Primario:** Se deniega cualquier intento de actualizar o eliminar al administrador central (usuario con ID 2 en la base de datos).
   * **Bloqueo de Modificación de Plantillas con Partidos Pendientes:** No es posible dar de baja o transferir a un jugador si representa el único elemento registrado en su club y este tiene encuentros oficiales agendados y sin jugar en el calendario, previniendo que se jueguen partidos con equipos vacíos.
5. **Bloqueo de Temporadas Finalizadas (Middleware `verificarTemporadaFinalizada`):** Middleware Express que intercepta todas las peticiones de escritura (`POST`, `PUT`, `DELETE`) relacionadas con una temporada y verifica si esta tiene el campo `finalizada = true` en la base de datos. El middleware extrae el `temporada_id` de múltiples fuentes (body, params, query o indirectamente consultando el partido por su ID). Si la temporada está finalizada, retorna un código `403 Forbidden` con el mensaje de bloqueo, impidiendo:
   * Crear, editar, eliminar o finalizar partidos.
   * Generar o eliminar calendarios/fixtures.
   * Asignar o remover equipos de la temporada.
   * Realizar fichajes o transferencias de jugadores.
   * Actualizar datos de la temporada (nombre, fechas).
   * *Excepción:* La eliminación completa de la temporada (`DELETE /api/temporadas/:id`) está explícitamente excluida del middleware, permitiendo borrar temporadas finalizadas.

---

## 12. Manual de usuario

### Manual para el Lector / Aficionado (Público)

#### 1. Consulta de la Tabla de Clasificación
1. Ingrese a la página de inicio (`/`).
2. Desplácese hacia abajo hasta la sección **Tabla de Posiciones**.
3. Verifique el orden de clasificación (PTS y DP).
4. Si lo desea, cambie la temporada de consulta utilizando el desplegable superior. *(Nota: Si elige la temporada de "Amistosos", la interfaz le informará que no se generan clasificaciones oficiales).*
5. Haga clic sobre el nombre de cualquier equipo en la tabla para acceder a su ficha técnica.

#### 2. Visualización de los Máximos Anotadores
1. Haga clic en el botón **Pichichi** en el menú superior o barra inferior.
2. Observe el listado de los 10 mejores anotadores, identificando su nombre, club y cantidad de puntos acumulados.

#### 3. Visualización del Fixture y Resultados de Partidos
1. Navegue a la sección **Partidos**.
2. Utilice el selector para buscar encuentros por el nombre de un equipo en particular.
3. Filtre por una jornada específica para concentrar la búsqueda.
4. Para ver el desglose del partido, haga clic sobre la tarjeta de un partido programado o finalizado. Podrá ver quién encestó, comparar el rendimiento de ambos clubes y revisar sus posiciones.

---

### Manual para el Administrador de la Liga

#### 1. Acceso al Panel Administrativo
1. Haga clic en el botón **Login** de la barra superior.
2. Ingrese su usuario (ej: `admin`) y contraseña. Presione **Ingresar**.
3. Si el login es correcto, aparecerá el botón **Admin** en su barra de navegación. Haga clic en él para ingresar al Dashboard de Control.

#### 2. Gestión de una Nueva Temporada
1. En la pestaña **Temporadas**, llene el formulario con el nombre (ej. "Torneo Apertura 2026"), fecha de inicio y de fin. Guarde los datos. *(Recuerde que el torneo debe abarcar un período mínimo de 5 meses).*
2. En la lista de temporadas inferiores, haga clic en el botón de **Estrella (Activar)** para definirla como la temporada en curso.
3. Para inscribir clubes, utilice el formulario de **Asignar Equipos** seleccionando los equipos que participarán.

#### 3. Registro de Clubes
1. Vaya a la pestaña **Equipos**.
2. Complete el nombre, entrenador y el estadio local.
3. Cargue el logo del club y seleccione la temporada en la que participará por primera vez.
4. Presione guardar. El equipo quedará registrado de inmediato.

#### 4. Alta de Jugadores y Fichajes
1. En la pestaña **Jugadores**, ingrese el nombre del jugador, seleccione su categoría de edad y asígnele una camiseta (dorsal) libre.
2. Si desea traspasar a un jugador a otro equipo o desvincularlo:
   * Diríjase a la sección inferior de **Fichajes / Agentes Libres**.
   * Seleccione al jugador, elija el club de destino en el desplegable (o elija "Liberar Jugador" para dejarlo como Agente Libre) e ingrese la temporada asociada. Guarde el traspaso.

#### 5. Generación del Calendario de Partidos (Fixture)
1. En la pestaña **Partidos**, ubique la tarjeta superior de generación de fixtures.
2. Elija la temporada activa.
3. Presione el botón **Generar Calendario**.
4. El sistema validará que los equipos inscritos tengan jugadores y que la cantidad de clubes sea par, y poblará de forma automática todas las jornadas con partidos de ida y vuelta distribuidos uniformemente.

#### 6. Registrar Resultados de un Partido (Finalización de Encuentro)
1. En la lista de partidos de la pestaña **Partidos**, ubique el encuentro que desea finalizar y haga clic en **Finalizar**.
2. Ingrese los puntos anotados por el equipo local y el visitante.
3. El sistema cargará automáticamente la plantilla de jugadores de ambos equipos. Ingrese los puntos individuales que metió cada jugador.
4. *Verifique que la sumatoria de puntos coincida con el marcador.* El sistema validará en tiempo real y habilitará el botón de guardar cuando los totales coincidan exactamente. Guarde los resultados.

#### 7. Finalizar una Temporada
1. En la pestaña **Temporadas**, localice la temporada activa en el panel de configuración rápida.
2. Presione el botón **Finalizar Temporada**.
3. Se abrirá un modal de confirmación con el **resumen de pendientes** de esa temporada:
   * Cantidad de partidos totales, partidos sin jugar y partidos jugados sin resultado/marcador cargado.
   * Cantidad de equipos inscritos.
4. Revise el resumen. Si hay partidos sin jugar o sin marcador, el sistema se lo advertirá. Puede continuar igualmente.
5. Presione **Confirmar y Finalizar** para cerrar oficialmente la temporada.
6. Una vez finalizada, todos los formularios y controles relacionados con esa temporada se deshabilitarán automáticamente (edición de temporada, asignación de equipos, generación de fixtures, creación/edición/finalización de partidos y fichajes de jugadores). Se mostrará un badge `🔒 Finalizada` en los selectores de temporada.

#### 8. Reabrir una Temporada Finalizada
1. En la pestaña **Temporadas**, si la temporada activa se encuentra finalizada, aparecerá el botón **Reabrir Temporada** en el panel de configuración rápida.
2. Presione **Reabrir Temporada** para desbloquear todos los controles de edición y volver al estado normal de la temporada.

---

## 13. Manual técnico

### Requisitos Previos del Sistema
* Servidor con Node.js (v18.x.x o superior) y gestor de paquetes `npm`.
* Motor de base de datos PostgreSQL en ejecución local o remota.

### Pasos de Instalación y Despliegue Local

#### 1. Configuración de Base de Datos
* Inicie su terminal de PostgreSQL o pgAdmin.
* Execute la sentencia para crear el espacio de base de datos:
  ```sql
  CREATE DATABASE liga_basket_TPO;
  ```
* Seleccione la base de datos y cargue la estructura de tablas completa utilizando las sentencias SQL especificadas en la sección [Base de datos](#8-base-de-datos). Esto inicializará las restricciones de integridad relacional, el borrado en cascada y sembrará la temporada predeterminada número 1.

#### 2. Configuración del Servidor Backend
* Ingrese a la carpeta del backend: `cd backend`
* Instale las dependencias del proyecto:
  ```bash
  npm install
  ```
* Cree un archivo de configuración de entorno `.env` en la raíz de la carpeta `/backend` y defina las credenciales de conexión:
  ```env
  PORT=5000
  DB_USER=admin_basket
  DB_PASSWORD=basket123
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=liga_basket_TPO
  JWT_SECRET=Cam1016012448*
  ```
* Inicie el servidor en modo desarrollo (usando Nodemon para recarga en caliente):
  ```bash
  npm run dev
  ```

#### 3. Configuración del Cliente Frontend
* Ingrese a la carpeta del frontend: `cd ../frontend`
* Instale las librerías dependientes:
  ```bash
  npm install
  ```
* Inicie el servidor de Vite en modo de desarrollo local:
  ```bash
  npm run dev
  ```
* Abra su navegador web en la dirección indicada: `http://localhost:5173`.

#### 4. Despliegue en Producción
* **Servidor Backend:** Instale un gestor de procesos en segundo plano como `pm2` para mantener el proceso vivo:
  ```bash
  npm install -g pm2
  pm2 start src/server.js --name "liga-basket-backend"
  ```
* **Cliente Frontend:** Genere el compilado optimizado (dist) ejecutando:
  ```bash
  npm run build
  ```
  Esto creará la carpeta `/dist` con archivos HTML, CSS y JS listos para alojarse en cualquier servidor estático como Nginx, Apache o plataformas Cloud (Vercel, Netlify).

---

## 14. Conclusiones

La plataforma web de gestión **NextGen League** representa una solución integral sólida, robusta y con una excelente estructura de desacoplamiento de componentes. El uso de sentencias SQL avanzadas para realizar cálculos en caliente (como el cálculo de stands de clasificación en tiempo real) reduce la carga lógica del backend y agiliza las respuestas. El sistema cuenta con todas las garantías de seguridad (JWT, encriptación, validaciones relacionales cruzadas) y una experiencia de usuario interactiva y optimizada para producción.

---

## 15. Referencias

* **React (v19.0.0):** [https://react.dev/](https://react.dev/)
* **Vite (v8.0.1):** [https://vite.dev/](https://vite.dev/)
* **Express (v5.2.1):** [https://expressjs.com/](https://expressjs.com/)
* **PostgreSQL pg Client (v8.20.0):** [https://node-postgres.com/](https://node-postgres.com/)
* **JSON Web Tokens (JWT):** [https://jwt.io/](https://jwt.io/)
* **TailwindCSS (v4.2.4):** [https://tailwindcss.com/](https://tailwindcss.com/)
* **React Router DOM (v7.13.2):** [https://reactrouter.com/](https://reactrouter.com/)
