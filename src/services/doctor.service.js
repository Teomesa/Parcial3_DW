import pool from '../config/database.js'; 
export class DoctorService {
    async getDoctorById(doctorId) {
        try {
            const result = await pool.query(
                `SELECT d.*, s.name as specialty_name 
                FROM doctor d
                JOIN specialty s ON d.specialty_id = s.id
                WHERE d.id = $1`,
                [doctorId]
            );
            return result.rows[0];
        } catch (error) {
            throw new Error('Error al obtener doctor: ' + error.message);
        }
    }

    async getDoctorAppointments(doctorId, date = null) {
        try {
            let query = `
                SELECT ma.*, p.name as patient_name
                FROM medicalappointment ma
                JOIN patient p ON ma.patient_id = p.id
                WHERE ma.doctor_id = $1
            `;
            const params = [doctorId];

            if (date) {
                query += ' AND ma.date = $2';
                params.push(date);
            }

            query += ' ORDER BY ma.date, ma.hour';
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error('Error al obtener citas: ' + error.message);
        }
    }
}