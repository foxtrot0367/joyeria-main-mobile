# Joyeria — Tienda online de joyeria

Boutique de joyeria personalizada: catalogo, carrito, favoritos, pedidos, cupones,
administracion y area de cliente. Las piezas se muestran con **imagenes de producto**
(clasicas fotografias, sin visor 3D).

## Estructura
- `joyeria-frontend/` — React 18 + TypeScript + Vite (SPA). Dev en :5173.
- `joyeria-backend/` — Spring Boot 3 + Spring Security (JWT) + Postgres. API REST en /api, puerto :8080.

## Requisitos
- Node 18+
- Java 17+
- Maven 3.9+
- PostgreSQL 16/17
- Docker (opcional, para despliegue)

## Arranque local

### Frontend
```bash
cd joyeria-frontend
npm install
npm run dev        # http://localhost:5173
```

### Backend
```bash
cd joyeria-backend
mvn spring-boot:run   # http://localhost:8080/api/...
```

### Con Docker
```bash
cp .env.example .env
# Edita .env con tus credenciales
docker compose up --build
```

## Variables de entorno

| Variable | Descripcion | Default |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexion PostgreSQL | `jdbc:postgresql://localhost:5432/joyeria` |
| `DATABASE_USERNAME` | Usuario de base de datos | `joyeria_user` |
| `DATABASE_PASSWORD` | Contrasena de base de datos | `joyeria_password` |
| `JWT_SECRET` | Secreto para firmar tokens JWT (Base64) | (requerido) |
| `JWT_EXPIRATION` | Expiracion del token en ms | `86400000` |
| `FRONTEND_URL` | URL del frontend para CORS | `http://localhost:5173` |
| `SERVER_PORT` | Puerto del servidor | `8080` |

## Tests

### Backend
```bash
cd joyeria-backend
mvn test
```

### Frontend
```bash
cd joyeria-frontend
npm run lint
```

## Notas
- No se incluyen credenciales, .env ni secretos; generarlos localmente.
- Paleta: negro profundo + dorado #D4AF37 (lujo).
- El backend usa Flyway para migraciones de base de datos.
- El frontend usa variables de entorno para la URL de la API (`VITE_API_URL`).
