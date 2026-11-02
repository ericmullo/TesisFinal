# Sistema de evaluación de riesgo crediticio

Proyecto académico con frontend React, API Spring Boot, PostgreSQL y un servicio Python para la predicción de riesgo.

## Requisitos

- Java 17 y Maven
- PostgreSQL
- Node.js y npm
- Python con las dependencias de `cooperativa-ia/requirements.txt`

## Configuración local

Antes de iniciar el backend, configure `DB_PASSWORD` y `JWT_SECRET`. La base de datos predeterminada es `jdbc:postgresql://localhost:5432/cooperativa_db` con usuario `postgres`; puede cambiarla mediante `DB_URL` y `DB_USERNAME`.

Flyway crea el esquema desde `cooperativa-backend/src/main/resources/db/migration` al iniciar la API. Si la base ya contiene tablas, se adopta como versión 0 y se ejecuta la migración inicial sin borrar datos. Conviene hacer una copia de seguridad antes del primer arranque con una base existente. Si hay clientes con cédulas duplicadas, la migración conserva los datos y omite el índice único hasta que se resuelvan esos duplicados.

El backend también acepta `IA_URL` (predeterminado `http://localhost:8000`), `FRONTEND_URL` (predeterminado `http://localhost:5173`) y `DOCUMENTS_STORAGE_PATH` para conservar los documentos fuera del directorio de trabajo. Para el envío de correo mediante Gmail API se usan `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` y `GMAIL_FROM_EMAIL`.

```powershell
cd cooperativa-backend
mvn spring-boot:run
```

En otra terminal:

```powershell
cd cooperativa-ia
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

En otra terminal:

```powershell
cd cooperativa-frontend
npm install
npm run dev
```

El frontend usa `http://localhost:8080/api` por defecto. Configure `VITE_API_URL` si la API tiene otra dirección.

## Datos simulados

La consulta de buró es una simulación académica estable por cédula. Puede devolver un perfil ficticio o «sin historial». No consulta una fuente externa ni confirma ingresos, gastos o empleo: esos datos los registra el analista en la solicitud. La evaluación de IA usa las variables guardadas en la solicitud.
