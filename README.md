# CineMarea

Sitio local independiente de cartelera y alimentos, conectado a Neon Postgres y un bucket privado de Neon Object Storage. El panel de cuenta usa Neon Auth para registrar e iniciar sesión en las cuentas de este proyecto.

## Iniciar

1. Conserva `.env.local` en la raíz del proyecto; `neon init` y `neon deploy` la crean y actualizan. No la compartas ni la subas al repositorio.
2. Instala dependencias con `npm install`.
3. Compila con `npm run build`.
4. Inicia con `npm run start` y abre <http://127.0.0.1:3000>.

Cartelera y Alimentos son rutas HTML independientes dentro del mismo sitio; la navegación se mantiene en la pestaña actual. La ruta anterior `/mx/solo-alimentos?country=mx` sigue disponible como alias en el servidor local. Cada página tiene su propia ruleta: Cartelera muestra las imágenes promocionales de cine seleccionadas para esa página, mientras Alimentos rota únicamente sus ocho anuncios de comida. La lista de películas permanece en su catálogo separado. La página de Alimentos tiene búsqueda, 8 categorías y 50 productos con imágenes enlazadas al CDN público del menú de referencia, fichas y carrito de muestra. No muestra precios inventados, no procesa pedidos ni pagos, y remite al menú oficial para disponibilidad por complejo.

## Catálogo de referencia México

La app sirve un snapshot JSON local en `/api/v1/mx/catalog.json`. Se preparó con títulos y ciudades observados en la página pública de Cinépolis México el 19 de octubre de 2026. Cada título ahora apunta al cartel del CDN de contenido de Cinépolis (`pimcore-content.cinepolis.com`); el navegador carga esas imágenes directamente y usa una imagen local solo como respaldo donde existe. El JSON y los títulos no son un feed en vivo; las funciones requieren elegir un complejo y consultar Cinépolis. No hay horarios ficticios en la interfaz. Este proyecto local de demostración no descarga ni redistribuye los archivos de imagen.

El repositorio `afilhodaniel/cinepolis_api` describe una API/parser Rails para la cartelera de Brasil, con Rails 4.2.5.1 y Ruby 2.3 como versiones recomendadas; no es una fuente actual de catálogo mexicano. Por eso esta app no reutiliza su extractor ni presenta esos datos como mexicanos: ofrece un endpoint propio y un snapshot limitado. Para datos en vivo se necesitaría acceso autorizado a una API/feed vigente de México.

Para trabajar con recarga local, ejecuta `npm run dev` (Vite usa el puerto 5173 por defecto).

## Preparar despliegue en Vercel

La app se compila como sitio estático en `dist/`; `vercel.json` conserva también la ruta `/mx/solo-alimentos`. No subas `.env.local`, `.neon`, credenciales ni `node_modules`: ya están excluidos por `.gitignore`. Para Neon Auth en el despliegue, configura `VITE_NEON_AUTH_URL` en el entorno de compilación de Vercel y agrega el dominio de Vercel a los dominios de confianza de Neon Auth. Si se conecta la integración oficial de Neon con Vercel, puede administrar esos orígenes para producción y las vistas previas.

Publica el proyecto solo bajo un dominio que controles y mantén claro que es un proyecto independiente. No uses un dominio de otra empresa.

## Cuenta y servicios

- El botón de persona abre el acceso de cuenta conectado a Neon Auth.
- `npm run smoke:db` ejecuta una consulta de lectura contra Postgres.
- `npm run smoke:auth` comprueba el endpoint de sesión anónima.
- `npm run smoke:storage` escribe, lee y elimina un objeto temporal en el bucket privado `assets`.
- `.env.local` y credenciales de almacenamiento no deben incluirse en commits. Las credenciales de S3 solo se usan del lado servidor.

Los carteles y fotos del menú de Cinépolis se muestran desde las URLs públicas observadas en sus páginas: <https://cinepolis.com/mx?country=mx> y <https://cinepolis.com/mx/solo-alimentos?country=mx>. Esta demo no descarga ni redistribuye los archivos remotos. La navegación de salas y horarios abre la página oficial porque la disponibilidad cambia por cine y fecha; promociones y compras son demostrativas y no realizan transacciones.
