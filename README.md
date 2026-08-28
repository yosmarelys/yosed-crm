# Yosed CRM

CRM enfocado en ventas para una clínica estética (microblading, pestañas, Morpheus8, láser, etc.), inspirado en la interfaz de Bitrix24 con un acabado visual estilo Apple.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** para el sistema de diseño
- **Prisma + PostgreSQL** como base de datos (compatible con Vercel Postgres/Neon para despliegue)
- **Server Actions** para mutaciones, **SWR** para datos en vivo (chat, notificaciones, reloj)
- **@hello-pangea/dnd** para los tableros Kanban (Pipeline de ventas y Diseño)
- **recharts** para las gráficas del panel

## Primeros pasos (local)

Necesitas una base de datos Postgres accesible (local, Docker o un free tier como Neon).

```bash
cp .env.example .env   # y coloca tu DATABASE_URL de Postgres + un SESSION_SECRET
npm install
npm run db:push     # sincroniza el schema
npm run db:seed      # importa y limpia los datos reales del Excel del negocio
npm run dev
```

Abre `http://localhost:3000/login`.

## Desplegar en Vercel (para obtener un link público)

1. En [vercel.com](https://vercel.com), inicia sesión con tu cuenta de GitHub.
2. "Add New" → "Project" → importa el repo `yosmarelys/yosed-crm` y selecciona la rama `claude/crm-bitrix-interface-6w9mwb`.
3. Antes de desplegar, ve a la pestaña **Storage** del proyecto → "Create Database" → elige **Postgres** → conéctala al proyecto (esto agrega automáticamente las variables de conexión).
4. En **Settings → Environment Variables**, agrega:
   - `DATABASE_URL` = el connection string de Postgres que te dio Vercel (usa el que dice recomendado para Prisma / con pooling).
   - `SESSION_SECRET` = cualquier texto largo aleatorio.
   - `ANTHROPIC_API_KEY` = tu API key de Claude (console.anthropic.com), necesaria para las funciones de IA de la sección Diseño (resumen de conversaciones y análisis final). Si no la agregas, el resto del CRM funciona igual, esos dos botones solo mostrarán un aviso.
5. Dale a **Deploy**. El comando de build (`npm run build`) ya sincroniza el schema y vuelve a importar los datos limpios del negocio en cada despliegue, así que no hace falta ningún paso manual adicional.
6. Cuando termine, Vercel te da una URL pública (`https://tu-proyecto.vercel.app`) — ahí puedes iniciar sesión con cualquiera de los usuarios de demostración.

> Nota: cada vez que se vuelva a desplegar el proyecto (por ejemplo, tras un nuevo cambio), la base de datos se reimporta desde cero con los datos originales del negocio, para que la demo siempre arranque limpia.

### Usuarios de demostración

Todos con contraseña `yosed2024`:

| Correo | Rol |
| --- | --- |
| admin@yosed.com | Administrador |
| andres@yosed.com | Ventas |
| yoselid@yosed.com | Ventas |
| maria@yosed.com | Diseño |
| carla@yosed.com | Campañas |

## Módulos

- **Panel**: KPIs de ventas, ingresos/comisiones por mes, embudo de leads, top vendedores.
- **Clientes**: buscador y ficha con historial completo de servicios (importado de la base real).
- **Pipeline**: Kanban de leads por etapa (Nuevo → Contactado → Interesado → Agendado → Ganado/Perdido), arrastrar y soltar, filtros por fuente/agente, conversión a cliente.
- **Facturación**: registro de servicios facturados, estado de pago (pagada/pendiente/vencida), alta rápida de nuevas facturas.
- **Servicios**: catálogo de precios editable en línea.
- **Asistencia**: contador de entrada/salida en la barra superior (como el de Bitrix) + tabla de horas de los últimos 14 días.
- **Chat interno**: canales de equipo con mensajes en vivo (polling).
- **Diseño**: tablero Kanban de solicitudes creativas para el equipo de diseño. Cada tarjeta tiene resumen de conversaciones con el cliente (IA), opinión del vendedor, opinión del cliente y un análisis final combinado (IA, vía Claude) — clic en una tarjeta para editarla.
- **Campañas**: gestión de campañas publicitarias, presupuesto, gasto y costo por lead, conectado a la fuente de los leads.
- **Automatización**: reglas activas (facturas vencidas, seguimiento de citas, bienvenida a clientes nuevos) con ejecución manual o vía notificación automática.

## Datos

Los datos de clientes, facturación y leads provienen del histórico real del negocio (hoja de cálculo original), limpiados y normalizados en `prisma/seed-data/*.json` y cargados por `prisma/seed.ts`.
