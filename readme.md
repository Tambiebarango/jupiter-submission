# Lendesk Submission

A small Node (TypeScript and Express) API for signing up and logging in users. User records are stored in Redis hashes, and passwords are hashed and checked with bcrypt.

## Requirements

- Node.js 24 or later
- Redis running locally on `localhost:6379` (the Redis client uses this default connection)

## Setup and running

Install the dependencies:

```sh
npm install
```

Start your Redis server, then start the API:

```sh
node src/app.ts
```

The API listens on port `3000`.

## API

Both endpoints accept a JSON body with `username` and `password`.

### `POST /signup`

Creates a user if the username is available and the password is at least 8 characters long and includes an uppercase letter, a lowercase letter, and a number. The password is stored as a bcrypt hash in a Redis hash under the username key.

Example request:

```sh
curl -i http://localhost:3000/signup \
  -H 'Content-Type: application/json' \
  -d '{"username":"alex","password":"StrongPass1"}'
```

Success response status (`200`):

```text
Signup successful!
```

Invalid input, an existing username, or another signup error returns `400` with an error message, for example:

```text
Oops: Username is already taken
```

### `POST /login`

Checks the supplied password against the bcrypt hash stored for the username.

Example request:

```sh
curl -i http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"alex","password":"StrongPass1"}'
```

Success response (`200`):

```text
Logged in!
```

Missing credentials or a failed login returns `401`:

```text
Invalid username or password
```

## Tests

The service tests use Vitest and mock Redis and bcrypt, so they do not require a running Redis server.

Run the test suite once:

```sh
npm test -- --run
```

Run Vitest in watch mode:

```sh
npm test
```

## Considerations for future development
