import bcrypt from 'bcrypt';
import pool from '../config/database.js';  

export class PatientService {
    async verifyCredentials(email, password) {
        const result = await pool.query(
            'SELECT * FROM patient WHERE email = $1',
            [email]
        );
        
        const patient = result.rows[0];
        if (!patient) return null;

        const validPassword = await bcrypt.compare(password, patient.password);
        return validPassword ? patient : null;
    }

    async getAppointments(patientId, date = null) {
        let query = `
            SELECT ma.*, d.name as doctor_name, s.name as specialty
            FROM medicalappointment ma
            JOIN doctor d ON ma.doctor_id = d.id
            JOIN specialty s ON d.specialty_id = s.id
            WHERE ma.patient_id = $1
        `;
        const params = [patientId];

        if (date) {
            query += ' AND ma.date = $2';
            params.push(date);
        }

        query += ' ORDER BY ma.date, ma.hour';
        const result = await pool.query(query, params);
        return result.rows;
    }

    async createAppointment(patientId, doctorId, date, hour) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Verificar disponibilidad
            const conflicts = await client.query(
                `SELECT * FROM medicalappointment 
                 WHERE (doctor_id = $1 OR patient_id = $2) 
                 AND date = $3 AND hour = $4`,
                [doctorId, patientId, date, hour]
            );

            if (conflicts.rows.length > 0) {
                throw new Error('Conflict');
            }

            const result = await client.query(
                `INSERT INTO medicalappointment (patient_id, doctor_id, date, hour)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [patientId, doctorId, date, hour]
            );

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}