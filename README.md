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

## Notas
- No se incluyen credenciales, .env ni secretos; generarlos localmente.
- Paleta: negro profundo + dorado #D4AF37 (lujo).
- El backend usa Flyway para migraciones de base de datos.
- El frontend usa variables de entorno para la URL de la API (`VITE_API_URL`).
