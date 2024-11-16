import { PatientService } from '../services/patient.service.js';
import { AuthMiddleware } from '../middleware/auth.js';

export class PatientController {
  constructor() {
      this.patientService = new PatientService();
  }

  login = async (req, res) => {
      try {
          const { email, password } = req.body;
          const patient = await this.patientService.verifyCredentials(email, password);
          
          if (!patient) {
              return res.status(401).json({
                  status: 'error',
                  message: 'Credenciales inválidas'
              });
          }

          const token = AuthMiddleware.generateToken({
              id: patient.id,
              role: 'patient'
          });

          res.json({
              status: 'success',
              message: 'Login exitoso',
              data: {
                  token,
                  user: {
                      id: patient.id,
                      name: patient.name,
                      email: patient.email
                  }
              }
          });
      } catch (error) {
          res.status(500).json({
              status: 'error',
              message: error.message
        });
    }
  }
  
  getAppointments = async (req, res) => {
    try {
        const appointments = await this.patientService.getAppointments(
            req.user.id,
            req.query.date
        );

        res.json({
            status: 'success',
            data: {
                total: appointments.length,
                citas: appointments
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
  }

  createAppointment = async (req, res) => {
    try {
      const appointment = await this.patientService.createAppointment(
        req.user.id,
        req.body.doctorId,
        req.body.date,
        req.body.hour
      );
      res.status(201).json(appointment);
    } catch (error) {
      if (error.message === 'Conflict') {
        res.status(409).json({ message: 'Horario no disponible' });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  updateAppointment = async (req, res) => {
    try {
        const updatedAppointment = await this.patientService.updateAppointment(
            req.params.appointmentId,
            req.user.id,
            {
                doctorId: req.body.doctorId,
                date: req.body.date,
                hour: req.body.hour
            }
        );

        res.json({
            status: 'success',
            message: 'Cita actualizada exitosamente',
            data: {
                id: updatedAppointment.id,
                fecha: new Date(updatedAppointment.date).toLocaleDateString('es-CO'),
                hora: updatedAppointment.hour.slice(0, 5),
                doctor_id: updatedAppointment.doctor_id
            }
        });
    } catch (error) {
        if (error.message === 'Cita no encontrada') {
            res.status(404).json({
                status: 'error',
                message: 'Cita no encontrada'
            });
        } else if (error.message === 'Horario no disponible') {
            res.status(409).json({
                status: 'error',
                message: 'El horario seleccionado no está disponible'
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
  }

  deleteAppointment = async (req, res) => {
    try {
        const result = await this.patientService.deleteAppointment(
            req.params.appointmentId,
            req.user.id
        );

        if (!result) {
            return res.status(404).json({
                status: 'error',
                message: 'Cita no encontrada o no pertenece al paciente'
            });
        }

        res.json({
            status: 'success',
            message: 'Cita eliminada exitosamente',
            data: {
                id: result.id,
                fecha: new Date(result.date).toLocaleDateString('es-CO'),
                hora: result.hour.slice(0, 5)
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