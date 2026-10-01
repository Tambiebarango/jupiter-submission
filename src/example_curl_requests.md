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
-H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im5ld1VzZXIiLCJpYXQiOjE3OTA4OTc1OTEsImV4cCI6MTc5MDkwMTE5MX0.t85Nw2Asmfo01hYwMtDAMrf3QuxCG7EGpkbRb4jcE0Y"
```
