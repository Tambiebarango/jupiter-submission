### /signup

```curl
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newUser",
    "password": "Jupiter123"
  }'
```

### /login

```curl
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newUser",
    "password": "Jupiter123"
  }'
```

### /foo

```curl
curl http://localhost:3000/foo \
-H "Content-Type: application/json" \
-H "Authorization: <JWT_TOKEN>"
```
