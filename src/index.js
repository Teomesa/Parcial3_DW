import express from 'express';
import patientRoutes from './routes/patient.routes.js';
import doctorRoutes from './routes/doctor.routes.js';

const app = express();

app.use(express.json());

// Ruta de prueba simple
app.get('/', (req, res) => {
    res.json({ 
        message: 'API Médica funcionando correctamente',
        endpoints: {
            login: 'POST /patient/login',
            verCitas: 'GET /patient/appointment',
            crearCita: 'POST /patient/appointment',
            verDoctor: 'GET /doctor/:doctorId',
            verCitasDoctor: 'GET /doctor/:doctorId/appointment'
        }
    });
});

// Rutas originales
app.use('/patient', patientRoutes);
app.use('/doctor', doctorRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});