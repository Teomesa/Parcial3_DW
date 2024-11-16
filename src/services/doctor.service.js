import pool from '../config/database.js';

export class DoctorService {
    async getDoctorById(doctorId) {
        try {
            const result = await pool.query(
                `SELECT 
                    d.id,
                    d.name,
                    d.age,
                    d.email,
                    s.name as specialty_name,
                    d.created_at
                FROM doctor d
                JOIN specialty s ON d.specialty_id = s.id
                WHERE d.id = $1`,
                [doctorId]
            );

            if (result.rows.length === 0) {
                return null;
            }

            const doctor = result.rows[0];
            return {
                id: doctor.id,
                nombre: doctor.name,
                edad: doctor.age,
                email: doctor.email,
                especialidad: doctor.specialty_name,
                fecha_registro: new Date(doctor.created_at).toLocaleDateString('es-CO')
            };
        } catch (error) {
            throw new Error('Error al obtener doctor: ' + error.message);
        }
    }

    async getDoctorAppointments(doctorId, date = null) {
        try {
            let query = `
                SELECT 
                    ma.id,
                    ma.date,
                    ma.hour,
                    p.name as patient_name,
                    p.age as patient_age
                FROM medicalappointment ma
                JOIN patient p ON ma.patient_id = p.id
                WHERE ma.doctor_id = $1
            `;
            const params = [doctorId];

            if (date) {
                const [day, month, year] = date.split('-');
                const formattedDate = `${year}-${month}-${day}`;
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
                paciente: {
                    nombre: appointment.patient_name,
                    edad: appointment.patient_age
                }
            }));
        } catch (error) {
            throw new Error('Error al obtener citas: ' + error.message);
        }
    }
}