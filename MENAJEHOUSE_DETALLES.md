# Resumen de la Aplicación: MenajeHouse

Esta aplicación es un sistema de gestión de ventas y retiros de mercadería para un negocio de menaje. Actualmente está construida con tecnologías modernas de frontend y utiliza Firebase como backend.

## Arquitectura Técnica

- **Frontend**: Vue 3 (Composition API)
- **Framework de UI**: Vuetify 3 (basado en Material Design)
- **Gestión de Estado**: Pinia
- **Base de Datos y Auth**: Firebase (Firestore para datos, Authentication para usuarios)
- **Herramienta de Construcción**: Vite

## Modelos de Datos (Firestore)

### 1. Clientes (`clientes`)
Almacena la información de contacto de los clientes.
- `id`: Identificador único.
- `nombre`: Nombre completo del cliente.
- `email`: Correo electrónico.
- `telefono`: Número de contacto.

### 2. Ventas (`ventas`)
Registra cada transacción realizada.
- `id`: Identificador único.
- `codigo`: Código de referencia de la venta.
- `monto`: Valor total de la venta.
- `cliente`: ID del cliente asociado.
- `tipo`: Tipo de venta (ej: "Local", "Web").
- `fecha`: Fecha y hora de la venta (formato ISO).
- `modoPago`: Método de pago utilizado.

### 3. Retiros (`retiros`)
Gestiona la entrega de mercadería que no se retira en el momento de la venta.
- `id`: Identificador único.
- `ventaId`: Referencia a la venta original.
- `clienteId`: Referencia al cliente.
- `monto`: Monto asociado al retiro.
- `estado`: `pendiente`, `completado` o `cancelado`.
- `fecha`: Fecha de creación del registro.
- `retiradoPor`: Nombre de la persona que retira.
- `fechaRetiro`: Fecha en que se completó el retiro.

## Funcionalidades Principales

1. **Dashboard**: Visualización de métricas clave y gráficos de ventas mensuales utilizando Chart.js.
2. **Gestión de Ventas**: Registro de nuevas ventas, visualización de ventas del día y acceso al historial completo.
3. **Gestión de Clientes**: CRUD (Crear, Leer, Actualizar, Eliminar) de la base de datos de clientes.
4. **Control de Retiros**: Seguimiento de productos pendientes de entrega, permitiendo marcar retiros como completados.
5. **Autenticación**: Sistema de login y registro para operarios del sistema.

## Flujo de Trabajo Actual

La aplicación utiliza almacenes de Pinia (`ventasStore`, `clientesStore`, `retirosStore`) para interactuar con Firebase. Los datos se cargan de forma asíncrona y se mantienen reactivos en la interfaz de usuario.
