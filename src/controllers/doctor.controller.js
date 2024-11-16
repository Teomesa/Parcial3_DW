import { DoctorService } from '../services/doctor.service.js';

export class DoctorController {
    constructor() {
        this.doctorService = new DoctorService();
    }

    getDoctorById = async (req, res) => {
        try {
            const doctor = await this.doctorService.getDoctorById(req.params.doctorId);
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor no encontrado' });
            }
            res.json(doctor);
        } catch (error) {
            console.error('Error en getDoctorById:', error);
            res.status(500).json({ message: error.message });
        }
    }

    getDoctorAppointments = async (req, res) => {
        try {
            const appointments = await this.doctorService.getDoctorAppointments(
                req.params.doctorId,
                req.query.date
            );
            res.json(appointments);
        } catch (error) {
            console.error('Error en getDoctorAppointments:', error);
            res.status(500).json({ message: error.message });
        }
    }
}