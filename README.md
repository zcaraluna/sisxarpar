# Sis-ARPAR

Sistema de Administración de Institutos de la Armada Paraguaya

## Descripción

Sis-ARPAR es un sistema completo para administrar los institutos de enseñanza de la Armada Paraguaya. Permite gestionar inscripciones, facturación, sistema académico y certificados.

## Características

- **Módulo de Inscripción**: Los encargados pueden inscribir alumnos con sus datos personales
- **Módulo de Caja**: Los cajeros pueden generar facturas y cobros, con soporte para facturar a terceros
- **Sistema Académico**: Los profesores pueden cargar notas de los alumnos
- **Certificados**: El jefe de estudios puede generar certificados de estudios
- **Estadísticas**: Dashboard detallado de ingresos con gráficos y reportes exportables
- **Panel del Alumno**: Los alumnos pueden ver sus inscripciones, notas y certificados

## Tecnologías

- Next.js 16.0.10
- React 18+
- TypeScript
- PostgreSQL
- Prisma ORM
- NextAuth.js v5
- Tailwind CSS
- Recharts (gráficos)
- ExcelJS (exportación Excel)
- jsPDF (exportación PDF)

## Requisitos Previos

- Node.js 18+ 
- PostgreSQL
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd sis-arpar
```

2. Instalar dependencias:
```bash
npm install --legacy-peer-deps
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sis_arpar?schema=public"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="change-this-to-a-random-secret-key-in-production"
AUTH_TRUST_HOST=true
```

4. Configurar la base de datos:
```bash
npx prisma migrate dev
```

5. Generar el cliente de Prisma:
```bash
npx prisma generate
```

6. Poblar la base de datos con datos de ejemplo:
```bash
npm run db:seed
```

Esto creará usuarios de ejemplo para todos los roles con la contraseña: `123456`

6. Ejecutar el servidor de desarrollo:
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Roles del Sistema

- **ADMIN**: Acceso completo al sistema
- **ENCARGADO**: Puede inscribir alumnos
- **CAJERO**: Puede generar facturas y ver estadísticas
- **PROFESOR**: Puede cargar notas de sus materias asignadas
- **JEFE_ESTUDIOS**: Puede generar certificados y ver estadísticas
- **ALUMNO**: Puede ver sus inscripciones, notas y certificados

## Estructura del Proyecto

```
sis-arpar/
├── app/                    # Rutas de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas del dashboard
│   └── api/               # API routes
├── components/            # Componentes React
│   ├── ui/               # Componentes UI reutilizables
│   └── layout/           # Componentes de layout
├── lib/                  # Utilidades y configuraciones
├── prisma/               # Schema de Prisma
└── types/                # Tipos TypeScript
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Inicia el servidor de producción
- `npm run lint`: Ejecuta el linter

## Licencia

Este proyecto es propiedad de la Armada Paraguaya.

