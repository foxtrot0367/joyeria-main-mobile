# joyeria â€” Tienda online de joyeria

Boutique de joyeria personalizada: catalogo, carrito, favoritos, pedidos, cupones,
administracion y area de cliente. Las piezas se muestran con **imagenes de producto**
(clasicas fotografias, sin visor 3D).

## Estructura
- joyeria-frontend/ â€” React 19 + TypeScript + Vite (SPA). Dev en :5173.
- joyeria-backend/  â€” Spring Boot 3 + Spring Security (JWT) + Postgres. API REST en /api, puerto :8080.

## Requisitos
Node 18+, Java 17+, Maven, Postgres 16/17.

## Arranque local
Frontend:
`
cd joyeria-frontend
npm install
npm run dev        # http://localhost:5173
`
Backend:
`
cd joyeria-backend
mvn spring-boot:run   # http://localhost:8080/api/...
`
Config de BD y JWT en joyeria-backend/src/main/resources/application.yml (NO se sube con credenciales reales; crea la tuya). Postgres debe estar levantado con una base creada.

## Notas
- No se incluyen credenciales, .env ni secretos; generarlos localmente.
- Paleta: negro profundo + dorado #D4AF37 (lujo).
