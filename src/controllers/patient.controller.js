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
                message: '❌ Credenciales inválidas. Por favor, verifica tu email y contraseña.'
            });
        }

        const token = AuthMiddleware.generateToken({
            id: patient.id,
            role: 'patient'
        });

        res.json({
            status: 'success',
            message: '✅ ¡Inicio de sesión exitoso! Bienvenido(a) ' + patient.name,
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
            message: '❌ Error al iniciar sesión: ' + error.message
        });
    }
  } 

  
  getAppointments = async (req, res) => {
    try {
        const appointments = await this.patientService.getAppointments(
            req.user.id,
            req.query.date
        );

        const message = req.query.date 
            ? `📅 Citas encontradas para la fecha ${req.query.date}`
            : '📅 Listado de todas tus citas';

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
            message: '❌ Error al obtener las citas: ' + error.message
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

        res.status(201).json({
            status: 'success',
            message: '✅ ¡Cita agendada exitosamente!',
            data: appointment
        });
    } catch (error) {
        if (error.message === 'Conflict') {
            res.status(409).json({
                status: 'error',
                message: '❌ El horario seleccionado no está disponible. Por favor, elige otro horario.'
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: '❌ Error al crear la cita: ' + error.message
            });
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
            message: '✅ Cita actualizada exitosamente',
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
                message: '❌ No se encontró la cita especificada'
            });
        } else if (error.message === 'Horario no disponible') {
            res.status(409).json({
                status: 'error',
                message: '📅 El horario seleccionado no está disponible'
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
        const appointment = await this.patientService.deleteAppointment(
            req.params.appointmentId,
            req.user.id
        );

        if (!appointment) {
            return res.status(404).json({
                status: 'error',
                message: '❌ No se encontró la cita especificada'
            });
        }

        res.json({
            status: 'success',
            message: '✅ Cita eliminada exitosamente',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '❌ Error al eliminar la cita: ' + error.message
        });
    }
  }
}