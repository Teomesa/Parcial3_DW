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
                  message: '❌ Doctor no encontrado'
              });
          }

          res.json({
              status: 'success',
              message: `👨‍⚕️ Información del Dr(a). ${doctor.nombre}`,
              data: doctor
          });
      } catch (error) {
          res.status(500).json({
              status: 'error',
              message: '❌ Error al obtener información del doctor: ' + error.message
          });
      }
  }

  getDoctorAppointments = async (req, res) => {
      try {
          const appointments = await this.doctorService.getDoctorAppointments(
              req.params.doctorId,
              req.query.date
          );

          const message = req.query.date 
              ? `📅 Citas del doctor para la fecha ${req.query.date}`
              : '📅 Todas las citas del doctor';

          res.json({
              status: 'success',
              message,
              data: {
                  total: appointments.length,
                  citas: appointments
              }
          });
      } catch (error) {
          res.status(500).json({
              status: 'error',
              message: '❌ Error al obtener las citas del doctor: ' + error.message
          });
      }
  }
}