# ROADMAP.md — Plan de modernización por fases

**Proyecto:** Joyería — e-commerce full stack
**Base:** AUDIT.md (auditoría del 2026-10-08)
**Regla:** no avanzar a una fase sin autorización explícita y sin que la anterior deje el proyecto sin errores críticos.

---

## Principios de ejecución

- Commits pequeños y descriptivos (`feat(auth): ...`, `fix(cart): ...`).
- Tras cada cambio importante: compilar, tests, lint, revisar regresiones.
- No romper contratos API existentes sin migración frontend+backend coordinada.
- No eliminar funcionalidades sin justificación documentada.
- No añadir dependencias sin pasar el checklist del prompt (§39).
- Si un cambio rompe algo: **detener y corregir** antes de continuar.

---

## FASE 0 — Auditoría ✅ (completada 2026-10-08)

**Resultado:** `AUDIT.md`, `ROADMAP.md`, `ARCHITECTURE.md`.
**Verificación dinámica:** lint frontend con 3 errores, build frontend con 2 errores TS, backend no compila (JDK 17 < 25 requerido), Docker no instalado localmente.

---

## FASE 1 — Estabilización ✅ (completada 2026-10-08)

**Objetivo:** builds en verde, arranque posible, eliminar riesgos evidentes. Sin nuevas features.

**Resultado:** builds en verde y **backend arrancado y verificado en vivo** con BD nueva.

- Migración duplicada: se renombró `V2__add_google_id_to_users.sql` → `V8__add_google_id_to_users.sql` (la duplicada era la de Google ID; `V2__align_cart_table_with_entity.sql` se mantiene porque entornos existentes ya la aplicaron como versión 2). Flyway aplica V1→V8 en BD limpia ✅.
- `spring:` duplicado fusionado (C2); como efecto secundario el bloque OAuth2 con `client-id` vacío pasó a activo y rompía el arranque → **eliminado** temporalmente (dependencia en pom.xml conservada; se restaura con credenciales reales en Fase 3).
- Seed restringido a `@Profile("dev")` y sin loguear credenciales; compose con `SPRING_PROFILES_ACTIVE` (C5).
- Bypass de Google eliminado en backend y frontend (C3); errores TS/lint de `Login.tsx`/`Register.tsx` resueltos con esa eliminación (C8) — lint 0 errores.
- Pagos: ownership de pedido (404), idempotencia (no re-procesar pagado), `PaymentRequest` sin datos de tarjeta (C4/C7 parcial) y Checkout sin PAN (F11) ✅.
- Quick wins: `@Valid` en 7 PUT sin validar, null-checks → 401 en `/api/auth/me` y `/api/reviews/check` (B-M7/B-M8), CORS desde `FRONTEND_URL` (B-A10) ✅.
- JDK 25 instalado (Temurin 25.0.1.8) y documentado (I-A7); `.gitignore` += `uploads/`.
- **Verificación final:** `mvn test` 13/13 ✅, `npm run lint` 0 errores ✅, `npm run build` ✅. Smoke tests en vivo: arranque 4.7s, Flyway 8/8, productos/categorías 200, login user+admin con `type=Bearer`, `/me` y endpoint admin 200, sin token → 401, validación PUT → 400 con detalle, pago con pedido inexistente → 404 controlado, header CORS correcto.

**Pendiente explícito:** C6 (rotar `JWT_SECRET` e limpiar historial git) — pospuesto, requiere coordinación; OAuth real (Fase 3); pasarela real (Fase 5).

**Tareas:**
1. Renumerar `V2__align_cart_table_with_entity.sql` → `V8__align_cart_table_with_entity.sql` (C1). *(V8 para no alterar checksums de migraciones ya aplicadas fuera de este entorno; verificar orden de aplicación.)*
2. Fusionar el bloque `spring:` duplicado en `application.yml` (C2).
3. Frontend: corregir 2 errores TS de `Login.tsx` (`window.google`) y 3 errores de lint (C8).
4. Decidir e instalar entorno backend: JDK 25 (recomendado, mantiene `pom.xml`) o bajar `java.version` a 17/21. Documentar en README. (I-A7)
5. Deshabilitar/condicionar `DataInitializer`: `@Profile("dev")` + no loguear credenciales (C5).
6. Retirar el bypass `POST /api/auth/google` hasta implementar verificación real (C3) — desactivar endpoint + frontend, sin romper login clásico.
7. `PaymentService`: no marcar pedidos como pagados sin pasarela + exigir ownership (C4, mitigación mínima de Fase 1; integración completa en Fase 5).
8. Quitar `cardNumber`/`cvv`/`expiry` del flujo frontend→backend (C7 parcial: superficie PCI).
9. Corregir quick wins de seguridad: CORS con `FRONTEND_URL` (B-A10), `@Valid` faltantes (B-M7), null-check de `Authentication` en `/auth/me` y `/reviews/check` (B-M8).
10. `.gitignore`: añadir `uploads/`.
11. Ejecutar: `mvn test`, `npm run lint`, `npm run build`.

**Archivos afectados:** `application.yml`, migración V2→V8, `Login.tsx`, `DataInitializer.java`, `AuthController.java`/`SecurityConfig.java`, `PaymentService.java`/`PaymentController.java`, `Checkout.tsx`, `misc.service.ts`, controllers con PUT sin `@Valid`, `.gitignore`.
**Riesgos:** la renumeración Flyway puede afectar BDs que ya aplicaron un V2 (verificar `flyway_schema_history` en cada entorno); retirar el endpoint Google afecta al frontend (coordinar en mismo commit).
**Criterio de salida:** `mvn test` ✅, `npm run lint` ✅, `npm run build` ✅, backend arranca con BD nueva, sin hallazgos críticos abiertos de AUDIT.md §3 (excepto C6, que requiere coordinación).

---

## FASE 2 — Arquitectura ✅ (completada)

**Objetivo:** limpieza estructural sin cambiar comportamiento visible.

**Estado: COMPLETADA** — commits `b8d1e17`…`fa9396e` (11 commits).

**Resumen de implementación:**
1. ✅ Código muerto backend: `SearchRequest`, `Cart.sessionId`+`findBySessionId`, `validateCouponForOrder`, `createGuestTicket`+regla guest `permitAll` (el frontend nunca la usó) + migración `V9__drop_orphan_columns.sql` (`cart.session_id`, `support_tickets.customer_name/email`, `ticket_responses.is_staff`, `inventory.reference`) — `b8d1e17`.
2. ✅ `@CrossOrigin` eliminado de los 16 controllers, solo CORS central (`B-M15`) — `5a5f167`.
3. ✅ `GlobalExceptionHandler` completo (405/415/400 de tipo, `instanceof FieldError` sin cast ciego) + `SecurityConfig` con `authenticationEntryPoint`/`accessDeniedHandler` en JSON (`B-M5`) — `085f8f1`.
4. ✅ Frontend: `utils/errors.ts` (`getErrorMessage`, 16 archivos convertidos — `F-M5`), `utils/shipping.ts` con constantes compartidas (`F-M4`), dedupe de servicios (`F-M6`: `adminService` sin métodos de entidad, `coupon.service.ts` nuevo, `orderService.getAllOrders(page,size,status)`) — `5208faa`, `445deee`.
5. ✅ Hook `useAbortableEffect` + `signal` en servicios (`product`, `user`) aplicado a `Catalog` y `ProductDetail` (`F-M3`) — `f69e568`.
6. ✅ `ErrorBoundary` montado en `main.tsx` (`F-A3`) — `05d4158`.
7. ✅ 401 sin `window.location`: evento `auth:session-expired` + `SessionWatcher` en `App` + banner en `Login` (`F-A2`); `logout` memoizado — `4c8fac2`.
8. ✅ `tsconfig`: `noUnusedLocals: true`, `vite.config.ts` en `include`, `@eslint/js@^9` declarado en devDependencies — `d3eb047`.
9. ✅ Dead code frontend: `SearchBar.tsx`, `ProductTurntable.tsx`, `three`/`@types/three`, `localStorage['user']` (nadie lo leía) — `fa9396e`.

**Verificación final:** `mvn test` 13/13 ✅, `npm run lint` 0 errores (9 warnings preexistentes) ✅, `tsc --noEmit` ✅, `npm run build` ✅. Smoke tests en vivo: Flyway aplicó V9 (now at v9), `/products` 200, sin token → 401 `{"success":false,"message":"No autenticado"}`, método no soportado → 405 JSON, `text/plain` → 415 JSON, token USER en `/admin/users` → 403 `{"message":"Acceso denegado"}`, login user+admin `type=Bearer`, admin stats 200.

**Pendiente explícito:** C6 (rotar `JWT_SECRET` e limpiar historial git) — pospuesto a Fase 3, requiere tu autorización.

**Tareas:**
1. Backend: eliminar código muerto (`SearchRequest`, `validateCouponForOrder`→integrarlo, `createGuestTicket`, `Cart.sessionId`, columnas huérfanas vía migración V9 si aplica).
2. Unificar CORS: eliminar `@CrossOrigin` de 17 controllers, usar solo `CorsConfigurationSource` (B-M15).
3. Completar `GlobalExceptionHandler` (405/415/400 de tipo, sin cast ciego a `FieldError`) + error handler de seguridad con JSON (B-M5).
4. Frontend: extraer `getErrorMessage()` a `utils` (F-M5), constantes de envío compartidas (F-M4), deduplicar servicios admin vs entidad (F-M6).
5. Frontend: hooks personalizados para datos (`useAbortableFetch`) y estados de carga (F-M3).
6. Frontend: `ErrorBoundary` a nivel App (F-A3).
7. Interceptor 401 sin `window.location`: evento + redirección controlada con mensaje (F-A2).
8. Ordenar `tsconfig` (`noUnusedLocals` cuando sea viable, incluir `vite.config.ts`), declarar `@eslint/js`.
9. Eliminar código muerto: `SearchBar.tsx`, `ProductTurntable.tsx`, `three`, `@types/three`, estado `localStorage['user']`.

**Riesgos:** refactor de servicios frontend toca muchas páginas → verificar rutas manualmente tras cambios; nada de cambios de contratos API.
**Criterio de salida:** builds/tests/lint en verde; ningún endpoint cambia de contrato; código muerto eliminado; comportamiento idéntico.

---

## FASE 3 — Seguridad

**Objetivo:** autenticación robusta y autorización correcta.

**Tareas:**
1. ✅ Google OAuth: **sin credenciales en el entorno** → flujo deshabilitado documentado; eliminado `spring-boot-starter-oauth2-client` sin uso; `.env.example` explica cómo habilitarlo (B-A1, B-A2).
2. ✅ Refresh tokens con rotación + reuse detection + logout real + invalidación al cambiar/restablecer contraseña (B-M12): migración `V10__refresh_tokens`, `RefreshTokenService` (hash SHA-256, expiración 7 días, revocación de la familia ante reuse), `POST /api/auth/refresh` y `POST /api/auth/logout`, interceptor axios con cola de peticiones para refresh concurrente único.
3. ✅ IDOR tickets: ownership en lectura/escritura con el email del JWT (B-A3).
4. ✅ Cookies: **decisión — mantener tokens en `localStorage`** por ahora; el riesgo XSS queda mitigado con CSP estricta (`script-src 'self'`), HSTS y sesiones de access cortas con refresh. Migrar a cookie `httpOnly` exige `withCredentials` en axios, `allowCredentials` en CORS y protección CSRF — queda como mejora futura documentada (F-A4).
5. ✅ `nginx.conf`: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, nosniff y gzip; el script inline del tema se movió a `public/theme-init.js` para permitir CSP estricta (I-M1, F-A4).
6. ✅ Rate limit: XFF solo se acepta desde proxies de confianza (`TRUSTED_PROXIES`, IPs exactas o CIDR), regla de cupones corregida a `POST|/api/coupons/validate`, limpieza determinista por intervalo (I-A4, B-M1).
7. ✅ (local) Rotación JWT_SECRET + limpieza de historial git (C6): el secreto hardcodeado `YXJj…MjAyNg==` (initial import `07b2c68`) fue **purgado de los 43 commits** con `git filter-branch` (verificado: `git rev-list --all` + `git log -p` sin coincidencias, `git fsck` OK, tree de HEAD idéntico al pre-rewrite). Backup del repo espejo en `Temp\opencode\joyeria-backup.git`. **⚠️ Falta el push:** la credencial activa (`sixzyy`) no tiene permisos de escritura en `foxtrot0367/joyeria-main-mobile` (403). Con una cuenta autorizada ejecutar: `git push --force-with-lease origin main` (tracking ya apunta al remoto actual). El secreto purgado se considera **comprometido**: generar uno nuevo por entorno (`README.md`) y reemplazarlo en cualquier despliegue que lo use.
8. ✅ `DataInitializer` solo dev (Fase 1, verificado) + política de contraseñas letra+número (validación `@Pattern` en backend y `pattern` en frontend) + mensaje de registro uniforme para email/teléfono existentes, mitigado con rate limit 5/min (C5, B5).
9. ✅ Reseñas: moderación `PENDING` por defecto y verificación de compra en pedidos pagados (B-A5).

**Tests de seguridad (37 en verde):** AuthService (8), RefreshTokenService (7), RateLimitFilter (6), SupportService (5), CouponService (4), OrderService (4), ReviewService (3).

**Riesgos:** cambios en el flujo de auth afectan todas las sesiones; el paso a cookies httpOnly exige ajustar el interceptor axios; rotar el secreto invalida tokens vigentes.
**Criterio de salida:** ✅ sin bypass de auth; sin IDOR en endpoints existentes; logout real funcional (smoke en vivo: login → refresh → reuse = 401 → logout → refresh = 401); tests de seguridad backend añadidos. Pendiente: tarea 7 (C6) con autorización del usuario.

---

## FASE 4 — E-commerce ✅ (completada 2026-10-11)

**Objetivo:** catálogo, carrito, checkout y pedidos sólidos.

**Tareas:**
1. ✅ Catálogo: topes de `page/size` (`MAX_PAGE_SIZE=50`) y `sort` whitelist (400 fuera de lista) en `ProductService.buildPageable`; `ProductRepository.findFiltered` null-safe; migración `V11` con `pg_trgm` + índices GIN trigram (B-M3).
2. ✅ Carrito: stock acumulado y cantidad ≥1 validados en `CartService.addItem`; `CartItemDTO.productStock` expuesto; frontend deshabilita "−" en cantidad 1 y "+" en stock máximo, con banner de error y estado busy (B3, F-M1, B-B3).
3. ✅ Checkout: validación por campo (`validateShipping`), bloqueo de avance de paso y revalidación antes de pagar (C7).
4. ✅ Cupones: `CouponService.getValidCoupon` (activo, vigencia, `maxUses`) + chequeo de `minAmount` en `OrderService.resolveCoupon`; normalización `trim().toUpperCase()`; `uses_count` incrementado al consumir (B-A7).
5. ✅ Stock: `ProductRepository.findByIdForUpdate` con bloqueo pessimista (`@Lock(PESSIMISTIC_WRITE)`) en `createOrder`, evita sobreventa lógica (B-A6).
6. ✅ Pedidos: `OrderTimeline` (PENDING→PAID→PREPARING→SHIPPED→DELIVERED + banner CANCELLED) en confirmación; dashboard cuenta ingresos solo de pagos `COMPLETED` (`sumTotalByPaymentStatus`) (B-M11).
7. ✅ Favoritos: rating real y selector de cantidad limitado por stock en detalle; mover al carrito desde la lista (F-M9).
8. ✅ Email transaccional real por SMTP (`spring-boot-starter-mail`) con fallback honesto si no está configurado; `OrderCreatedEvent` (`@TransactionalEventListener AFTER_COMMIT`) y reset de contraseña; confirmación de pedido sin prometer correo (B-A4).
9. ✅ Precios: backend como única fuente de verdad vía `GET /api/cart/summary` (`CheckoutSummaryDTO`); el checkout consume totales del backend y ya no los calcula (F4.9).
- ✅ Extra: corregido `CartService` devolvía el carrito sin el ítem recién agregado en carrito nuevo (colección inversa `mappedBy` desactualizada); ahora `mapToDTO` consulta `CartItemRepository.findByCartId` (commit `f3f9061`).

**Tests (59 en verde):** AuthService (8), RefreshTokenService (7), RateLimitFilter (6), SupportService (5), CouponService (4), OrderService (13), ReviewService (3), ProductService (7), CartService (3), EmailService (5). Frontend: `npm run lint` (0 errores, 9 warnings preexistentes) y `npm run build` OK.

**Criterio de salida:** ✅ smoke en vivo contra BD local: registro → catálogo (paginación/sort y validaciones 400) → carrito (stock acumulado, sobre-stock 400) → `/cart/summary` → pedido (totales backend, stock 17→15 y `soldCount` +2) → cupón (10% aplicado, `minAmount`/expirado 400, `uses_count` +1) → logout. Sin `quantity: 0`; sin sobreventa lógica.

---

## FASE 5 — Pagos ✅ (completada 2026-10-11)

**Objetivo:** integración Mercado Pago real (checkout pro + webhook).

**Tareas:**
1. ✅ Backend: preferencia de Checkout Pro (`POST /api/payments/checkout`); estados de pago con idempotencia (reutiliza pago `PENDING` por pedido; webhook y confirmación idempotentes por `preference_id`); webhook con verificación de firma HMAC-SHA256; reconciliación de monto + moneda contra el pago registrado (C4 completo).
2. ✅ Eliminado `PaymentRequest` con datos de tarjeta: el checkout es tokenizado por la pasarela, cero PAN en nuestros servidores; frontend solo envía `{orderId, paymentMethod}` (C7 PCI).
3. ✅ `POST /api/payments/webhook` implementado (ya no es 404 huérfano); `SecurityConfig` permite `/api/payments/webhook` y `/api/payments/webhook/**`.
4. ✅ Estados sincronizados con la pasarela: `approved→PAID/APPROVED`; `rejected/cancelled/refunded→rechazo`; solo la pasarela (webhook firmado o confirmación sandbox) marca un pedido como `PAID`.
5. ✅ Sandbox: `SandboxPaymentProvider` (por defecto en dev, rechazado en `prod`) simula la pasarela sin cobro real; `MercadoPagoPaymentProvider` real listo para credenciales; **sin claves `MERCADOPAGO_*` no se inventan** — queda preparado y documentado.
- ✅ Extra: eliminados `POST /api/payments/process` y `GET /api/payments/reference/{ref}` (IDOR C4); paquete `integration.payment` con `PaymentProvider`/`PaymentContext`/`PaymentPreference`; migración `V12__payment_preference.sql` (`preference_id` + índices único `ux_payments_preference_id`, `idx_payments_provider_reference`, `idx_payments_order_id`).
- ✅ Frontend: `paymentService.createCheckout/getStatus/confirmSandbox`; `Checkout.tsx` redirige a la pasarela (MP) o a la página de pago simulada; nueva `SandboxPaymentPage` (`/pago/sandbox`); `OrderConfirmation` refleja el estado de pago con sondeo automático mientras está `PENDING`.
- ✅ Mapeo de `PaymentProcessingException` a HTTP 400 en `GlobalExceptionHandler`.

**Tests (81 en verde, +22):** PaymentService (13), MercadoPagoSignatureVerifier (4), SandboxPaymentProvider (2), MercadoPagoPaymentProvider (3) sobre los 59 previos. Frontend: `npm run lint` (0 errores, 9 warnings preexistentes) y `npm run build` OK.

**Verificación E2E (sandbox, PostgreSQL local, `V12` aplicada):** registro→carrito→pedido (`PENDING`)→`checkout` (provider `sandbox`, `checkoutUrl` `/pago/sandbox?ref=…`, **no** marca pagado)→`sandbox/confirm` (pedido `PAID`/pago `APPROVED`)→`status` (`PAID`/`APPROVED`); confirmación y re-checkout idempotentes; webhook con firma inválida = `400` (no 404); `status` inexistente = `404`.

**Riesgos:** el webhook real requiere `MERCADOPAGO_ACCESS_TOKEN` + `MERCADOPAGO_WEBHOOK_SECRET` y URL pública; los estados dependen de la notificación de MP (mitigado con consulta activa `GET /v1/payments/{id}`).
**Criterio de salida:** ✅ flujo de pago sandbox verificado extremo a extremo; el webhook (y solo él, o la confirmación sandbox) actualiza el pedido; no es posible marcar `PAID` sin pasar por la pasarela.

---

## FASE 6 — Admin

**Objetivo:** dashboard con métricas correctas y CRUDs profesionales.

**Tareas:**
1. Dashboard: ventas del día/mes (solo pedidos pagados), pedidos, clientes, top productos, stock bajo — corrigiendo B-M11.
2. CRUD productos con imágenes (subida → Cloudinary si hay credenciales; si no, subida local a `uploads/` con volumen).
3. Pedidos: cambiar estado con máquina de estados, vista de detalle con cliente y productos.
4. Usuarios: roles, activar/desactivar, proteger último admin (B-B2).
5. Soporte admin: responder tickets (hoy no existe endpoint — B-M6) + ver respuestas en cliente.
6. Reseñas: moderación funcional.

**Criterio de salida:** el admin puede operar el ciclo completo de negocio sin tocar BD; métricas cuadran con datos reales.

---

## FASE 7 — UI/UX

**Objetivo:** dirección visual premium de joyería (elegante, minimalista, editorial; dorado como acento).

**Tareas:** rediseño progresivo por páginas: Home → catálogo → producto → carrito → checkout → perfil → admin. Tipografía, whitespace, jerarquía, microinteracciones suaves, cards consistentes. Corregir: rating fabricado (F-M9), imágenes sin fallback (F-M8), modal accesible (F-M13), `document.title` por ruta (F-M10), newsletter real (F-M7), NotFound dentro del layout.

**Riesgo:** no romper funcionalidad existente al tocar componentes; verificar cada página tras rediseñarla.

---

## FASE 8 — Mobile

**Objetivo:** experiencia diseñada para móvil (360–430px), no adaptada.

**Tareas:** sidebar admin responsive con hamburguesa (F-A5); revisar navbar, búsqueda, cards, carrito, checkout, formularios, modales; eliminar overflow horizontal; targets táctiles ≥44px; quick view accesible en móvil; `loading="lazy"` (F-M14).

**Criterio de salida:** verificación manual en 360/375/390/430px de todas las rutas públicas, cliente y admin; sin overflow ni elementos cortados.

---

## FASE 9 — Performance

**Objetivo:** optimización medida, sin premature optimization.

**Tareas:** revisar N+1 (B-M2), OSIV off + `@Transactional`/`JOIN FETCH` (B-M4), índices (B-B6), tamaños de página; frontend: debounce de búsqueda, memo donde aporte, imágenes responsive/WebP (Cloudinary si hay credenciales), revisar chunks. Medir antes/después.

---

## FASE 10 — Testing

**Objetivo:** cobertura de comportamiento crítico.

**Tareas:** backend — tests de `OrderService` (camino feliz), `PaymentService`, validación de cupones, controllers MockMvc, seguridad (ownership/roles); migraciones con Testcontainers o H2+Flyway; JaCoCo. Frontend — instalar Vitest, tests de `authService`/`CartContext`/componentes clave. E2E mínimo (Playwright): registro→login→producto→carrito→checkout→pedido.

**Criterio de salida:** `mvn test` con cobertura de los flujos críticos; al menos un E2E del camino feliz.

---

## FASE 11 — CI/CD

**Objetivo:** GitHub Actions en cada PR.

**Tareas:** workflow con install → lint → tests → build frontend → build backend → (opcional) docker build. Branch protection documentado. Opcional: dependency review.

**Nota:** la rama `main` actual ya falla lint/build — el workflow debe quedar en verde tras Fase 1.

---

## FASE 12 — Producción

**Objetivo:** despliegue real con seguridad perimetral.

**Tareas:** perfiles dev/prod en compose (exponer solo 80/443, no 5432/8080), TLS (certbot/traefik o Caddy), `.env` con secretos fuertes, volumen `uploads`, healthchecks correctos (actuator `/actuator/health` — requiere añadir starter), logs estructurados sin DEBUG, backups de Postgres, README completo (I-M5), LICENSE, rotación de secretos verificada (C6), Spring Boot 4.x (B-A8) como decisión explícita.

---

## Resumen de dependencias entre fases

```
0 auditoría → 1 estabilización → 2 arquitectura → 3 seguridad
                                    ↘ 4 e-commerce → 5 pagos → 6 admin
                                                    ↘ 7 UI/UX → 8 mobile → 9 performance
                     10 testing (paralelo desde Fase 3) → 11 CI/CD → 12 producción
```

- **Fase 1 es bloqueante** para todo lo demás (nada compila hoy).
- CI/CD (11) solo tiene sentido con builds en verde (Fase 1) — puede adelantarse a continuación de Fase 2 si lo deseas.
- Testing (10) puede iniciar en paralelo desde Fase 3.
