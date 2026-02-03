# Viajes Altairis - Backoffice MVP

Este proyecto es un MVP para la gestión centralizada de hoteles, tipos de habitación, inventario y reservas de Viajes Altairis.

## 🚀 Cómo levantar la Demo (Docker)

Sigue estos pasos para tener el sistema funcionando en menos de 5 minutos:

1. **Prerrequisitos**: Tener instalado [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. **Clonar el repositorio** (si no lo has hecho).
3. **Ejecutar el comando mágico**:
   ```bash
   docker-compose up --build
   ```
4. **Acceder a las aplicaciones**:
   - **Frontend (Next.js)**: [http://localhost:3000](http://localhost:3000)
   - **Backend API (Swagger)**: [http://localhost:5000/swagger](http://localhost:5000/swagger)
   - **Base de Datos**: SQL Server en el puerto 1433.

## 🛠 Módulos Implementados

- **Dashboard**: Panel principal con métricas de reservas y disponibilidad.
- **Hoteles**: CRUD completo de hoteles con búsqueda y paginación.
- **Tipos de Habitación**: Gestión de categorías de habitación asociadas a hoteles.
- **Inventario**: Control operativo diario con visualización de estado (semáforo).
- **Reservas**: Wizard de 3 pasos para creación de reservas y listado operativo.

## ⚙️ Tecnologías

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, Chart.js.
- **Backend**: .NET 8, Entity Framework Core, SQL Server.
- **Infraestructura**: Docker & Docker Compose.

## 📊 Datos de Prueba (Seed Data)

Al iniciar el sistema por primera vez, se cargarán automáticamente:
- 5 Hoteles internacionales.
- 15 Tipos de habitación.
- Inventario para los próximos 30 días con variaciones de disponibilidad.
- Reservas de ejemplo en distintos estados.

---
© 2026 Viajes Altairis - Demo Ready 🚀
