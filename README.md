# Sistema de Gestión de Citas Médicas

API REST para la gestión de citas médicas que permite a los pacientes agendar, modificar y eliminar citas con diferentes médicos especialistas.

### 🔑 La contraseña para todos los usuarios es admin123

## 🛠️ Tecnologías Utilizadas

- Node.js
- Express
- PostgreSQL
- JWT para autenticación
- Docker y Docker Compose

## 📌 Endpoints

### Para loguearse con un usuario del sistema:
#### Login de Paciente
```bash
curl -X POST http://localhost:3000/patient/login \
-H "Content-Type: application/json" \
-d '{
    "email": "ana.gomez@email.com",
    "password": "admin123"
}'
```
### Guardar token para usar en siguientes peticiones
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/patient/login \
-H "Content-Type: application/json" \
-d '{"email":"ana.gomez@email.com","password":"admin123"}' \
| jq -r '.data.token')
```

### Gestión de Citas

#### Obtener todas las citas del paciente
```bash
curl http://localhost:3000/patient/appointment \
-H "Authorization: Bearer $TOKEN" | jq
```

#### Filtrar citas por fecha
```bash
curl "http://localhost:3000/patient/appointment?date=20-11-2024" \
-H "Authorization: Bearer $TOKEN" | jq
```

#### Crear nueva cita
```bash
curl -X POST http://localhost:3000/patient/appointment \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "doctorId": 1,
    "date": "2024-11-20",
    "hour": "09:00"
}' | jq
```

#### Modificar cita existente
```bash
curl -X PUT http://localhost:3000/patient/appointment/1 \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "doctorId": 2,
    "date": "2024-11-21",
    "hour": "10:00"
}' | jq
```

#### Eliminar cita
```bash
curl -X DELETE http://localhost:3000/patient/appointment/1 \
-H "Authorization: Bearer {token}"
```

### Información de Doctores

#### Obtener información de un doctor en especifico segun ID
```bash
curl http://localhost:3000/doctor/1 \
-H "Authorization: Bearer $TOKEN" | jq
```

#### Obtener citas de un doctor
```bash
curl http://localhost:3000/doctor/1/appointment \
-H "Authorization: Bearer $TOKEN" | jq
```

#### Ver citas de un doctor por fecha
```bash
curl "http://localhost:3000/doctor/1/appointment?date=20-11-2024" \
-H "Authorization: Bearer $TOKEN" | jq
```

## 👥 Autor

- Mateo Restrepo Mesa
