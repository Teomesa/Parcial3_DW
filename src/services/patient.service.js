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
                  s.name as specialty_name,
                  ma.created_at
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

  // Tu método isValidDate existente
  isValidDate(dateString) {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date);
  }

  async updateAppointment(appointmentId, patientId, updatedData) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verificar que la cita existe y pertenece al paciente
        const existingAppointment = await client.query(
            'SELECT * FROM medicalappointment WHERE id = $1 AND patient_id = $2',
            [appointmentId, patientId]
        );

        if (existingAppointment.rows.length === 0) {
            throw new Error('Cita no encontrada');
        }

        // Verificar disponibilidad del nuevo horario
        const conflicts = await client.query(
            `SELECT * FROM medicalappointment 
            WHERE (doctor_id = $1 OR patient_id = $2) 
            AND date = $3 AND hour = $4 
            AND id != $5`,
            [updatedData.doctorId, patientId, updatedData.date, updatedData.hour, appointmentId]
        );

        if (conflicts.rows.length > 0) {
            throw new Error('Horario no disponible');
        }

        // Actualizar la cita
        const result = await client.query(
            `UPDATE medicalappointment 
            SET doctor_id = $1, date = $2, hour = $3
            WHERE id = $4 AND patient_id = $5
            RETURNING *`,
            [updatedData.doctorId, updatedData.date, updatedData.hour, appointmentId, patientId]
        );

        await client.query('COMMIT');

        // Obtener información completa de la cita actualizada
        const updatedAppointment = await client.query(
            `SELECT 
                ma.*, 
                d.name as doctor_name,
                s.name as specialty_name
            FROM medicalappointment ma
            JOIN doctor d ON ma.doctor_id = d.id
            JOIN specialty s ON d.specialty_id = s.id
            WHERE ma.id = $1`,
            [appointmentId]
        );

        const appointment = updatedAppointment.rows[0];
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

  async deleteAppointment(appointmentId, patientId) {
    try {
        // Primero verificamos que la cita exista y pertenezca al paciente
        const checkQuery = await pool.query(
            `SELECT ma.*, d.name as doctor_name 
             FROM medicalappointment ma
             JOIN doctor d ON ma.doctor_id = d.id
             WHERE ma.id = $1 AND ma.patient_id = $2`,
            [appointmentId, patientId]
        );

        if (checkQuery.rows.length === 0) {
            return null;
        }

        const appointment = checkQuery.rows[0];

        // Eliminar la cita
        await pool.query(
            'DELETE FROM medicalappointment WHERE id = $1 AND patient_id = $2',
            [appointmentId, patientId]
        );

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
        throw new Error('Error al eliminar la cita: ' + error.message);
    }
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