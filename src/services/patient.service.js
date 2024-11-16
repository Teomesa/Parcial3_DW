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
        try {
            let query = `
                SELECT 
                    ma.id,
                    ma.date,
                    ma.hour,
                    d.name as doctor_name,
                    s.name as specialty_name
                FROM medicalappointment ma
                JOIN doctor d ON ma.doctor_id = d.id
                JOIN specialty s ON d.specialty_id = s.id
                WHERE ma.patient_id = $1
            `;
            const params = [patientId];

            if (date) {
                const [day, month, year] = date.split('-');
                const formattedDate = `${year}-${month}-${day}`;
                
                if (!this.isValidDate(formattedDate)) {
                    throw new Error('Fecha inválida');
                }
                
                query += ' AND DATE(ma.date) = $2';
                params.push(formattedDate);
            }

            query += ' ORDER BY ma.date, ma.hour';
            
            const result = await pool.query(query, params);
            
            return result.rows.map(appointment => ({
                id: appointment.id,
                fecha: new Date(appointment.date).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                hora: appointment.hour.slice(0, 5),
                doctor: appointment.doctor_name,
                especialidad: appointment.specialty_name
            }));
        } catch (error) {
            throw new Error('Error al obtener citas: ' + error.message);
        }
    }

    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    async createAppointment(patientId, doctorId, date, hour) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verificar disponibilidad
            const conflicts = await client.query(
                `SELECT * FROM medicalappointment 
                WHERE (doctor_id = $1 OR patient_id = $2) 
                AND date = $3 AND hour = $4::time`,
                [doctorId, patientId, date, hour]
            );

            if (conflicts.rows.length > 0) {
                throw new Error('Conflict');
            }

            // Crear la cita
            const result = await client.query(
                `INSERT INTO medicalappointment (patient_id, doctor_id, date, hour)
                VALUES ($1, $2, $3, $4::time)
                RETURNING id, date, hour, patient_id, doctor_id`,
                [patientId, doctorId, date, hour]
            );

            // Obtener información completa de la cita creada
            const newAppointment = await client.query(
                `SELECT 
                    ma.id,
                    ma.date,
                    ma.hour,
                    d.name as doctor_name,
                    s.name as specialty_name
                FROM medicalappointment ma
                JOIN doctor d ON ma.doctor_id = d.id
                JOIN specialty s ON d.specialty_id = s.id
                WHERE ma.id = $1`,
                [result.rows[0].id]
            );

            await client.query('COMMIT');

            const appointment = newAppointment.rows[0];
            return {
                id: appointment.id,
                fecha: new Date(appointment.date).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                hora: appointment.hour.slice(0, 5),
                doctor: appointment.doctor_name,
                especialidad: appointment.specialty_name
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateAppointment(appointmentId, patientId, updatedData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verificar que la cita existe
            const currentAppointment = await client.query(
                `SELECT ma.*, d.name as doctor_name, s.name as specialty_name
                FROM medicalappointment ma
                JOIN doctor d ON ma.doctor_id = d.id
                JOIN specialty s ON d.specialty_id = s.id
                WHERE ma.id = $1 AND ma.patient_id = $2`,
                [appointmentId, patientId]
            );

            if (currentAppointment.rows.length === 0) {
                throw new Error('Cita no encontrada');
            }

            // Preparar datos actualizados
            const current = currentAppointment.rows[0];
            const newDoctorId = updatedData.doctorId || current.doctor_id;
            const newDate = updatedData.date || current.date;
            const newHour = updatedData.hour || current.hour.slice(0, 5);

            // Verificar conflictos
            const conflicts = await client.query(
                `SELECT * FROM medicalappointment 
                WHERE (doctor_id = $1 OR patient_id = $2) 
                AND date = $3 
                AND hour = $4::time 
                AND id != $5`,
                [newDoctorId, patientId, newDate, newHour, appointmentId]
            );

            if (conflicts.rows.length > 0) {
                throw new Error('Horario no disponible');
            }

            // Actualizar cita
            await client.query(
                `UPDATE medicalappointment 
                SET doctor_id = $1, date = $2, hour = $3::time
                WHERE id = $4 AND patient_id = $5`,
                [newDoctorId, newDate, newHour, appointmentId, patientId]
            );

            // Obtener cita actualizada
            const updatedAppointment = await client.query(
                `SELECT 
                    ma.id,
                    ma.date,
                    ma.hour,
                    d.name as doctor_name,
                    s.name as specialty_name
                FROM medicalappointment ma
                JOIN doctor d ON ma.doctor_id = d.id
                JOIN specialty s ON d.specialty_id = s.id
                WHERE ma.id = $1`,
                [appointmentId]
            );

            await client.query('COMMIT');

            const updated = updatedAppointment.rows[0];
            return {
                id: updated.id,
                fecha: new Date(updated.date).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                hora: updated.hour.slice(0, 5),
                doctor: updated.doctor_name,
                especialidad: updated.specialty_name
            };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteAppointment(appointmentId, patientId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verificar y obtener la cita
            const appointmentCheck = await client.query(
                `SELECT ma.*, d.name as doctor_name
                FROM medicalappointment ma
                JOIN doctor d ON ma.doctor_id = d.id
                WHERE ma.id = $1 AND ma.patient_id = $2`,
                [appointmentId, patientId]
            );

            if (appointmentCheck.rows.length === 0) {
                return null;
            }

            const appointment = appointmentCheck.rows[0];

            // Eliminar la cita
            await client.query(
                'DELETE FROM medicalappointment WHERE id = $1 AND patient_id = $2',
                [appointmentId, patientId]
            );

            await client.query('COMMIT');

            return {
                id: appointment.id,
                fecha: new Date(appointment.date).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                hora: appointment.hour.slice(0, 5),
                doctor: appointment.doctor_name
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}