# Joyeria — Tienda online de joyeria

Boutique de joyeria personalizada: catalogo, carrito, favoritos, pedidos, cupones,
administracion y area de cliente. Las piezas se muestran con **imagenes de producto**
(clasicas fotografias, sin visor 3D).

## Estructura
- `joyeria-frontend/` — React 18 + TypeScript + Vite (SPA). Dev en :5173.
- `joyeria-backend/` — Spring Boot 3 + Spring Security (JWT) + Postgres. API REST en /api, puerto :8080.

## Requisitos
- Node 18+
- Java 25+ (si el `java` del sistema es anterior, exporta `JAVA_HOME` hacia un JDK 25 antes de ejecutar Maven)
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
```powershell
cd joyeria-backend
$env:JWT_SECRET = [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Max 256 }))  # requerido; no lo commitees
$env:SPRING_PROFILES_ACTIVE = "dev"        # activa datos de prueba (DataInitializer)
mvn spring-boot:run   # http://localhost:8080/api/...
```

Sin el perfil `dev`, el backend arranca con la base de datos vacía (sin usuarios ni productos de prueba).

**Datos de prueba (solo perfil `dev`):**
- Admin: `admin@joyeria.com` / `admin123`
- Cliente: `maria@example.com` / `user1234`

## Despliegue con Docker

El `docker-compose.yml` está pensado para **producción**: solo el proxy TLS (Caddy) publica
puertos (`80`/`443`); PostgreSQL, el backend y el frontend quedan en la red interna de Docker.

### 1. Preparar variables
```bash
cp .env.example .env
# Genera secretos fuertes (NO reutilices los de ejemplo):
openssl rand -base64 48   # -> JWT_SECRET
openssl rand -base64 24   # -> DATABASE_PASSWORD
```
Edita `.env` y define al menos `DATABASE_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL`,
`DOMAIN` y `ACME_EMAIL`.

### 2. Producción (con HTTPS)
```bash
docker compose --profile tls up -d --build
```
Caddy obtiene y renueva el certificado de `DOMAIN` automáticamente (Let's Encrypt).
Con `DOMAIN=localhost` usa una CA interna (útil para pruebas).

### 3. Desarrollo (puertos locales + perfil `dev` con datos de prueba)
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
# Frontend http://localhost:5173 · API http://localhost:8080 · PostgreSQL :5432
```

### Healthchecks
- Backend: `GET /actuator/health` (incluye probes `liveness` y `readiness`).
- Frontend: `GET /` (nginx).
- PostgreSQL: `pg_isready`.

## Operaciones

### Backups de PostgreSQL
```bash
./scripts/backup-db.sh                                   # backups/joyeria-<fecha>.sql.gz (retención 30 días)
./scripts/restore-db.sh backups/joyeria-<fecha>.sql.gz
```
Programa el backup con `cron` (Linux) o el Programador de tareas (Windows), p. ej. diario a las 03:00.

### Logs
En producción (`SPRING_PROFILES_ACTIVE=prod`) el backend registra en nivel `INFO`
(Spring/Hibernate en `WARN`), sin `show-sql`. Ajusta `LOG_LEVEL` si hace falta.

### Rotación de secretos
`JWT_SECRET` es obligatorio y **no** tiene valor por defecto (el arranque falla si falta).
Para rotarlo: genera uno nuevo, actualízalo en `.env` y reinicia el backend
(`docker compose up -d backend`). Al rotarlo, los tokens ya emitidos dejan de ser válidos.

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
| `DOMAIN` | Dominio público servido por Caddy (TLS) | `localhost` |
| `ACME_EMAIL` | Correo para el certificado ACME (Let's Encrypt) | — |
| `TRUSTED_PROXIES` | Subredes de proxies confiables para `X-Forwarded-For` (CSV) | `172.16.0.0/12` |
| `LOG_LEVEL` | Nivel de log del backend en producción | `INFO` |
| `PAYMENT_PROVIDER` | `sandbox` (dev) o `mercadopago` | `sandbox` |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de Checkout Pro (si `mercadopago`) | — |

## Tests

### Backend
```bash
cd joyeria-backend
mvn test        # 119 tests (JUnit 5 + Mockito + MockMvc); informe JaCoCo en target/site/jacoco/
```

### Frontend
```bash
cd joyeria-frontend
npm run lint            # ESLint (0 errores)
npm test                # Vitest + Testing Library (20 tests)
npm run test:coverage   # tests + cobertura (v8)
npm run test:e2e        # Playwright (requiere backend y dev server activos)
```

## Integración continua (CI)

El workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) se ejecuta en cada `push` a `main` y en cada `pull_request` hacia `main`:

1. **Backend** (JDK 25): `mvn -B -ntp verify` — compila, ejecuta los 119 tests y empaqueta el jar. Sube el informe JaCoCo como artefacto.
2. **Frontend** (Node 20): `npm ci` → `npm run lint` → `npm run test:coverage` → `npm run build`. Sube el informe de cobertura.
3. **Docker** (solo en `push` a `main`): construye las imágenes de backend y frontend para validar los `Dockerfile`.

### Protección de rama (recomendada)

Configurar en *Settings → Branches → Add branch protection rule* para `main` (requiere permisos de administrador del repositorio):

- **Require a pull request before merging**.
- **Require status checks to pass before merging** → marcar `Backend (Java 25 / Maven)` y `Frontend (Node 20 / Vite)` como obligatorios.
- **Require branches to be up to date before merging**.
- (Opcional) *Require approvals* ≥ 1 y *Do not allow bypassing the above settings*.

> El job `Docker build` no se marca como obligatorio: se ejecuta solo en `push` a `main`.
> (Opcional) Puede añadirse `actions/dependency-review-action` en los PR una vez habilitado el grafo de dependencias del repositorio.

## Decisión: Spring Boot 4.x

El backend permanece en **Spring Boot 3.5.x** (línea 3.x) con Java 25. Spring Boot 4.0
(Spring Framework 7) es una migración mayor (revisión de APIs, dependencias y pruebas) que
se evaluará como iniciativa independiente y no dentro de esta fase de endurecimiento de
producción. Ruta prevista: abordarla en una rama aparte, validarla con la suite (119 tests)
y el E2E de Playwright, y desplegarla por separado.

## Notas
- No se incluyen credenciales, `.env` ni secretos; generarlos localmente (ver `.env.example`).
- Paleta: negro profundo + dorado #D4AF37 (lujo).
- El backend usa Flyway para migraciones de base de datos.
- El frontend usa variables de entorno para la URL de la API (`VITE_API_URL`).
- Licencia: [MIT](LICENSE).
- Exposición de puertos: en producción **solo** `80`/`443` (Caddy). PostgreSQL y el backend no publican puertos al host.
