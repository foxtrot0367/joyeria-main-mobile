# Joyeria

Aplicación full-stack para una tienda premium de joyería con catálogo, carrito, favoritos, pedidos, cupones, autenticación y administración.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Java 25 + Spring Boot 3 + Spring Security + JWT
- Base de datos: PostgreSQL
- Contenerización: Docker Compose

## Estructura del proyecto

```text
joyeria-main-mobile/
├── joyeria-frontend/        # Aplicación web del cliente
├── joyeria-backend/         # API REST y lógica de negocio
├── docker-compose.yml      # Servicios de base de datos y despliegue local
├── .env.example            # Variables de entorno de ejemplo
├── .gitignore
├── README.md
└── .github/
```

## Requisitos

- Node.js 18+
- Java 25+
- Maven 3.9+
- PostgreSQL 16+
- Docker + Docker Compose (opcional)

## Variables de entorno

Copia el archivo `.env.example` a `.env` y ajusta los valores según tu entorno:

```bash
cp .env.example .env
```

Variables principales:

- `DATABASE_NAME`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `FRONTEND_URL`

## Ejecutar localmente

### 1. Backend

```bash
cd joyeria-backend
mvn spring-boot:run
```

La API queda disponible en:

```text
http://localhost:8080
```

### 2. Frontend

```bash
cd joyeria-frontend
npm install
npm run dev
```

La aplicación web queda disponible en:

```text
http://localhost:5173
```

## Ejecutar con Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Esto levanta:

- PostgreSQL en el puerto `5432`
- Backend en el puerto `8080`
- Frontend en el puerto `80`

## Comandos útiles

### Backend

```bash
cd joyeria-backend
mvn clean install
mvn test
```

### Frontend

```bash
cd joyeria-frontend
npm install
npm run build
npm run lint
```

## Características principales

- Catálogo de productos
- Carrito de compras
- Favoritos
- Pedidos y seguimiento
- Cupones promocionales
- Autenticación con JWT
- Perfil y gestión de usuario
- Administrador para catalogación y ventas

## Notas

- El proyecto usa Flyway para migraciones de base de datos.
- La API y el frontend están preparados para trabajar juntos en desarrollo local.
- No se deben subir secretos ni variables reales al repositorio.

## Licencia

Este proyecto se entrega con fines de desarrollo y demostración interna.
