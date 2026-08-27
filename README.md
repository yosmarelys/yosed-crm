# Yosed CRM

CRM enfocado en ventas para una clínica estética (microblading, pestañas, Morpheus8, láser, etc.), inspirado en la interfaz de Bitrix24 con un acabado visual estilo Apple.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** para el sistema de diseño
- **Prisma + SQLite** como base de datos (fácil de correr localmente, migrable a Postgres)
- **Server Actions** para mutaciones, **SWR** para datos en vivo (chat, notificaciones, reloj)
- **@hello-pangea/dnd** para los tableros Kanban (Pipeline de ventas y Diseño)
- **recharts** para las gráficas del panel

## Primeros pasos

```bash
npm install
npm run db:push    # crea prisma/dev.db a partir del schema
npm run db:seed     # importa y limpia los datos reales del Excel del negocio
npm run dev
```

Abre `http://localhost:3000/login`.

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
- **Diseño**: tablero Kanban de solicitudes creativas para el equipo de diseño.
- **Campañas**: gestión de campañas publicitarias, presupuesto, gasto y costo por lead, conectado a la fuente de los leads.
- **Automatización**: reglas activas (facturas vencidas, seguimiento de citas, bienvenida a clientes nuevos) con ejecución manual o vía notificación automática.

## Datos

Los datos de clientes, facturación y leads provienen del histórico real del negocio (hoja de cálculo original), limpiados y normalizados en `prisma/seed-data/*.json` y cargados por `prisma/seed.ts`.
