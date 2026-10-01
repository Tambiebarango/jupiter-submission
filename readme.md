# Lendesk Submission

A small Node.js, TypeScript, and Express API for signing up and logging in users. Successful logins return a short-lived JWT.

## Requirements

- Node.js 24 or later
- Redis running locally on `localhost:6379`
- A JWT signing secret

## Setup and running

Install the dependencies:

```sh
npm install
```

Set `JWT_SECRET_KEY` in a local `.env` file to a long, random secret. The current implementation falls back to `"secret"` if `JWT_SECRET_KEY` is not configured.

Start Redis

```sh
redis-server
```
Then start the API:

```sh
node src/app.ts
```

The API listens on port `3000`.


## API

Both endpoints accept a JSON body with `username` and `password`.

### `POST /signup`

Creates a user if the username is available and the password is at least 8 characters long and includes an uppercase letter, a lowercase letter, and a number.

Example request:

```sh
curl -i http://localhost:3000/signup \
  -H 'Content-Type: application/json' \
  -d '{"username":"alex","password":"StrongPass1"}'
```

Success response (`200`):

```json
{ "message": "Signup successful!" }
```

Invalid input or an existing username returns `400` with a message, for example:

```json
{ "message": "Username is already taken" }
```

### `POST /login`

Checks the supplied password against the stored password for the username. A successful login returns an expiring JWT (`1h`) in `accessToken`.

Example request:

```sh
curl -i http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"alex","password":"StrongPass1"}'
```

Success response (`200`):

```json
{
  "message": "Logged in!",
  "accessToken": "<jwt>"
}
```

Missing credentials or a failed login returns `401`:

```json
{ "message": "Invalid username or password" }
```

### `GET /foo`

Protected endpoint. Send the JWT from the login response as the raw `Authorization` header value:

```sh
curl -i http://localhost:3000/foo \
  -H 'Authorization: <jwt>'
```

A valid token for an existing user returns `200`:

```json
{ "message": "bar!" }
```

The endpoint returns `401` when a verified token names a user that does not exist.

## Tests

The service tests use Vitest. To run the test suite:

```sh
npm test -- --run
```

## Considerations for future development

- Consider using `redis-om` for object mapping and simpler retrieval of user data from Redis.
