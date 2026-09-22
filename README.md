# Frontend React - Cooperativa 15 de Abril

## 1. Crear proyecto con Vite
```bash
npm create vite@latest cooperativa-frontend -- --template react
cd cooperativa-frontend
npm install
npm install react-router-dom
```

## 2. Copiar archivos
Copia la carpeta `src` de este paquete dentro de tu proyecto React.

## 3. Logo
Coloca `coop.png` dentro de:

```text
public/coop.png
```

## 4. Ejecutar
```bash
npm run dev
```

## Rutas
- `/` Login
- `/dashboard`
- `/clientes`
- `/solicitudes`
- `/documentos`
- `/evaluacion-riesgo`
- `/reportes`

## Conexión posterior con Spring Boot
Ejemplo:

```js
const response = await fetch("http://localhost:8080/api/clientes");
const data = await response.json();
```

Para POST:

```js
await fetch("http://localhost:8080/api/solicitudes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form)
});
```

En Spring Boot tendrás que permitir CORS para el puerto de React durante desarrollo, normalmente `http://localhost:5173`.
