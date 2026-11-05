# 📚 PoliBiblioteca

Aplicación para registrar y consultar libros. Está formada por dos servicios en contenedores:

| Servicio | Tecnología | Rol |
|---|---|---|
| `frontend` | Angular + Tailwind, servido con Nginx | Interfaz web (formulario y lista de libros) |
| `backend: api` | FastAPI + SQLite | API REST que guarda y lee los libros |

## Estructura

```
PoliBiblioteca/
├── backend/api/        API FastAPI (main.py, Dockerfile)
├── frontend/           Angular (Dockerfile, nginx.conf)
├── docker-compose.yml
├── .env.example
└── .github/workflows/  CI con GitHub Actions
```

## Cómo levantarlo

Requisitos: Docker Desktop abierto.

```bash
git clone <URL-DEL-REPO>
cd PoliBiblioteca
cp .env.example .env        # En PowerShell: Copy-Item .env.example .env
docker compose up --build
```

Abrir: http://localhost:8080

## Comunicación entre contenedores

El navegador solo habla con el contenedor `frontend`. Nginx redirige las peticiones `/api/` a `http://api:8000`, usando el **nombre del servicio** dentro de la red `app-net`. La API no publica puertos hacia afuera.

Prueba de ida y vuelta (guardar y leer un dato):

1. Registrar un libro en http://localhost:8080 y ver que aparece en la lista.
2. Llamar a la API desde dentro del contenedor `frontend`, por nombre de servicio:

```bash
docker compose exec frontend wget -qO- http://api:8000/api/books
```

## Variables de entorno

Se definen en `.env` (no se sube al repositorio). `.env.example` es la plantilla.

| Variable | Descripción |
|---|---|
| `DB_PATH` | Ruta del archivo SQLite dentro del contenedor (`/data/books.db`) |

## Persistencia

La base de datos vive en el volumen `api-data`, por lo que los datos sobreviven a `docker compose down`.

## Comandos útiles

- `docker compose ps` — ver contenedores y su estado
- `docker compose logs -f api` — ver logs de la API
- `docker compose down` — bajar contenedores (conserva los datos)
- `docker compose down -v` — bajar y borrar el volumen (se pierde la base de datos)

## Integración con el Pipeline CI

El workflow de GitHub Actions (`.github/workflows/ci.yml`) construye las imágenes, levanta los servicios y prueba guardar y leer un libro en cada push y pull request.