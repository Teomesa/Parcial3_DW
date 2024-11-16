import { DoctorService } from '../services/doctor.service.js';

export class DoctorController {
  constructor() {
      this.doctorService = new DoctorService();
  }

  getDoctorById = async (req, res) => {
      try {
          const doctor = await this.doctorService.getDoctorById(req.params.doctorId);
          if (!doctor) {
              return res.status(404).json({
                  status: 'error',
                  message: 'Doctor no encontrado'
              });
          }

          // Formatear la respuesta
          const formattedDoctor = {
              id: doctor.id,
              nombre: doctor.name,
              edad: doctor.age,
              email: doctor.email,
              especialidad: doctor.specialty_name,
              detalles: {
                  fecha_registro: new Date(doctor.created_at).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                  })
              }
          };

          res.json({
              status: 'success',
              data: formattedDoctor
          });
      } catch (error) {
          res.status(500).json({
              status: 'error',
              message: error.message
          });
      }
  }

  getDoctorAppointments = async (req, res) => {
      try {
          const appointments = await this.doctorService.getDoctorAppointments(
              req.params.doctorId,
              req.query.date
          );

          // Formatear las citas
          const formattedAppointments = appointments.map(apt => ({
              id: apt.id,
              fecha: new Date(apt.date).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
              }),
              hora: apt.hour.slice(0, 5),
              paciente: apt.patient_name,
              estado: apt.status || 'programada'
          }));

          res.json({
              status: 'success',
              data: {
                  total: appointments.length,
                  citas: formattedAppointments
              }
          });
      } catch (error) {
          res.status(500).json({
              status: 'error',
              message: error.message
          });
      }
  }
}