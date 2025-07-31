# Python FastAPI Bookmark Shortener

## Technologies
* `alembic` for database migration
* `sqlalchemy` database ORM
* `postgresql` database
* `redis` short time quick database
* `uvicorn` server
* `fastapi` framework


### Understand the project
Bookmark shortener backend application

* User:

    User can register/login via email and password, a redis session is created and it is used through-out the application for authentication, user can also logout from the application. Register and Login route will be public, while logout will be protected.

    - register
    - login
    - logout

* Bookmarks

    Once logged in, the user can create, read, update, and delete the bookmarks created. All the sub routes are protected.

    - create
    - get all
    - get by id
    - update by id
    - delete by id

* Shorten URL redirect

    User can access the short code to access the original content. This route will be public.


### Docker commands

```bash
docker run -p 6379:6379 redis
docker run -p 5432:5432 -e POSTGRES_PASSWORD=password -v $(pwd)/postgres_storage:/var/lib/postgresql/data postgres
```

### Run migrations (if available):
* create a new database `assistant_db`
* run the alembic migration to create the tables
```bash
alembic init alembic
alembic revision --autogenerate -m "first commit"
alembic upgrade head
```