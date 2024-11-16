export class Appointment {
    constructor(id, date, hour, patient_id, doctor_id) {
      this.id = id;
      this.date = date;
      this.hour = hour;
      this.patient_id = patient_id;
      this.doctor_id = doctor_id;
    }
  
    static async create(pool, appointment) {
      const result = await pool.query(
        'INSERT INTO medicalappointment (date, hour, patient_id, doctor_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [appointment.date, appointment.hour, appointment.patient_id, appointment.doctor_id]
      );
      return result.rows[0];
    }
  
    static async findByPatient(pool, patientId, date = null) {
      let query = `
        SELECT ma.*, d.name as doctor_name, d.specialty_id, s.name as specialty_name 
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
  }