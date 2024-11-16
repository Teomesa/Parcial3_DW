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
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = AuthMiddleware.generateToken({
        id: patient.id,
        role: 'patient'
      });

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  getAppointments = async (req, res) => {
    try {
      const appointments = await this.patientService.getAppointments(
        req.user.id,
        req.query.date
      );
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: error.message });
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
      const appointment = await this.patientService.updateAppointment(
        req.params.appointmentId,
        req.user.id,
        req.body
      );
      if (!appointment) {
        return res.status(404).json({ message: 'Cita no encontrada' });
      }
      res.json(appointment);
    } catch (error) {
      if (error.message === 'Conflict') {
        res.status(409).json({ message: 'Horario no disponible' });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  deleteAppointment = async (req, res) => {
    try {
      const success = await this.patientService.deleteAppointment(
        req.params.appointmentId,
        req.user.id
      );
      if (!success) {
        return res.status(404).json({ message: 'Cita no encontrada' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}