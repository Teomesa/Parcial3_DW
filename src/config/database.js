import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'medical_system',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin123'
});

// Verificar conexión
pool.on('error', (err) => {
    console.error('Error inesperado del pool de postgres', err);
});

export default pool;