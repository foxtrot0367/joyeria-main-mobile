# PROGRESS — Estado del proyecto (actualizado 2026-10-12)

Proyecto: modernización profesional del e-commerce de joyería (`joyeria-main-mobile`).
Plan maestro de 13 fases (FASE 0–12) siguiendo: explicar → modificar → tests/lint/build → documentar → notificar y **esperar autorización** antes de avanzar de fase.

Repo: `https://github.com/foxtrot0367/joyeria-main-mobile`
Estructura: `joyeria-backend` (Spring Boot 3.5 / Java 25 / PostgreSQL 17 / Flyway) y `joyeria-frontend` (React 18 + Vite 5 + TS + Tailwind).

---

## Cómo levantar el entorno

### PostgreSQL
```powershell
Get-Service postgresql-x64-17            # comprobar
Start-Service postgresql-x64-17          # arrancar si está detenido
```
BD `joyeria`, usuario `joyeria_user` / `joyeria_password`, puerto 5432. Flyway aplica V1→**V13** al arrancar.

### Backend (`joyeria-backend`)
```powershell
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-25.0.1.8-hotspot'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:JWT_SECRET = [Convert]::ToBase64String([byte[]](1..48 | ForEach-Object { Get-Random -Maximum 256 }))
$env:SPRING_PROFILES_ACTIVE = 'dev'
mvn -o spring-boot:run
```
- Tests: `mvn -o test` (95/95).
- API en `http://localhost:8080`. Uploads en `/uploads`.

### Frontend (`joyeria-frontend`)
```powershell
npm run dev      # http://localhost:5173  (proxy /api y /uploads -> :8080)
npm run lint     # baseline: 0 errores, 10 warnings
npm run build    # tsc -b && vite build
```
Credenciales seed (perfil `dev`): `admin@joyeria.com` / `admin123` (ADMIN, id=1), `maria@example.com` / `user1234` (USER).

---

## Estado de fases

| Fase | Tema | Estado |
|------|------|--------|
| F0 | Reconocimiento / auditoría | ✅ |
| F1 | Base / seguridad auth | ✅ |
| F2 | Catálogo / productos | ✅ |
| F3 | Pedidos / carrito | ✅ (3.7 force-push pendiente, ver bloqueos) |
| F4 | Búsqueda / filtros | ✅ |
| F5 | Pagos (Mercado Pago + sandbox) | ✅ (E2E real bloqueado sin credenciales) |
| F6 | Panel admin | ✅ |
| F7 | UI/UX | ✅ commit `5fca33d` |
| F8 | Mobile | ✅ commit `3056e82` |
| **F9** | **Performance** | 🚧 EN CURSO (cambios aplicados, sin commitear) |
| F10 | Testing | ⏳ pendiente |
| F11 | CI/CD | ⏳ pendiente |
| F12 | Cierre | ⏳ pendiente |

HEAD local: `3056e82`. Rama `main` `[ahead 65, behind 10]` respecto a `origin/main`.
Contadores: 88 endpoints (`TOTAL_MAPPINGS=88`, 21 controllers).

---

## FASE 9 — Performance (EN CURSO)

### Cambios aplicados (sin commitear)
Backend:
- `application.yml`: `spring.jpa.open-in-view: false` (B-M4) + `hibernate.default_batch_fetch_size: 30` (mitigación global de N+1).
- Transacciones de lectura `@Transactional(readOnly = true)` a nivel de clase:
  - `ProductService`, `OrderService`, `FavoriteService`, `SupportService`, `CategoryService`, `ReviewService`.
  - `CartService`: readOnly en clase + `@Transactional` (read-write) en `getCart` (hace `save()` de carrito vacío).
  - `ProductService.deleteProduct` → `@Transactional`.
  - `CategoryService`/`AddressService`/`ReviewService`: `@Transactional` en métodos de escritura.
  - `PaymentService.getPaymentStatus` → `@Transactional(readOnly = true)`.
- `ProductRepository`: nuevo `countActiveGroupedByCategory()` (agrega conteo por categoría).
- `CategoryService.getAllCategories()` usa el conteo agrupado → **elimina el N+1** de counts.
- **NUEVO** `db/migration/V13__favorite_fk_indexes.sql`: índices faltantes (B-B6)
  `support_tickets.user_id`, `ticket_responses.ticket_id`, `reviews.user_id` y UNIQUE `reviews(user_id, product_id)` (con dedupe previo).

Frontend:
- `ProductCard.tsx`: envuelto en `memo`.
- `Catalog.tsx`: `handleAddToCart` con `useCallback`; `onQuickView={setQuickView}`; **debounce 400 ms** en inputs de precio (Mín/Máx) usando `setSearchParams` funcional; `clearFilters` resetea el estado local.
- `AuthContext.tsx` y `CartContext.tsx`: callbacks con `useCallback` + value del provider con `useMemo`.
- `vite.config.ts`: ya tenía `manualChunks` (react/motion/icons) y `chunkSizeWarningLimit: 900`.

### Verificación
- `mvn -o test`: **95/95** ✅.
- Arranque real con OSIV off (perfil dev) contra PostgreSQL: OK, Flyway migró a **v13** ✅.
- Smoke E2E completo (`smoke6.ps1`): login admin, dashboard stats, upload, crear producto, compra + pago sandbox, detalle pedido admin, transiciones de estado, protección último admin, tickets de soporte (+respuesta admin, vista cliente), reseñas + moderación — **todo OK** ✅.
- Pruebas extra (rutas lazy bajo OSIV off): `/api/categories` (con `productCount`), `/api/admin/orders` (con items), `/api/favorites`, `/api/cart` → **200** ✅. Sin `LazyInitializationException`.
- Frontend: `npm run lint` → 0 errores / 10 warnings; `npm run build` → OK con chunks separados (react 162 kB, motion 122 kB, icons 30 kB, index 98 kB) ✅.

### Pendiente F9
1. Confirmar la prueba de favoritos con imágenes (chequeo de script, no del server).
2. Marcar FASE 9 como ✅ en `ROADMAP.md` (y `ARCHITECTURE.md` si aplica).
3. Commit `perf(...) (F9)`.
4. Notificar al usuario y **pedir autorización para FASE 10 — Testing**.

---

## Bloqueos / notas abiertas

- **Force-push FASE 3.7 (secreto JWT)**: `git push --force origin main` → 403; la cuenta `gh` activa es `sixzyy` y **no tiene permiso de escritura** en `foxtrot0367/joyeria-main-mobile`. El remoto aún contiene el secreto JWT (tratado como comprometido). Opciones: reautenticar como `foxtrot0367`, añadir `sixzyy` como colaborador, o push desde otra máquina.
- **E2E real de pagos**: bloqueado sin `MERCADOPAGO_ACCESS_TOKEN` real + URL pública (mitigado con `SandboxPaymentProvider` en dev).
- **Verificación manual móvil 360/375/390/430 px (F8)**: no ejecutable sin navegador (guardas automáticas ya aplicadas).

---

## Lecciones aprendidas / convenciones

- **NO usar `Get-Content -Raw` + `Set-Content`** para editar: corrompe acentos UTF-8 (BOM + mojibake). Usar siempre las herramientas de edición del CLI. (Ocurrió en `Navbar.tsx`, restaurado con `git checkout`.)
- PowerShell 5.1: no existe `Invoke-RestMethod -Form` (usar `curl.exe` para multipart); `$pid` es reservada (usar `$prodId`); `-Dtest=A,B` requiere comillas simples.
- El shell wrapper reporta `ChildProcess.kill` al lanzar procesos en segundo plano con `Start-Process`, pero el proceso **sí queda vivo**.
- Vite dev server corriendo en **5173**; backend en **8080**.

---

## Archivos clave

- `ROADMAP.md`, `ARCHITECTURE.md`, `AUDIT.md` (registro estático, no se edita), `README.md`.
- Migraciones Flyway: `joyeria-backend/src/main/resources/db/migration/V1…V13`.
- Script de smoke: `%TEMP%\opencode\smoke6.ps1`.
