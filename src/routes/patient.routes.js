import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller.js';
import { AuthMiddleware } from '../middleware/auth.js';
import { ValidationMiddleware } from '../middleware/validator.js';
import { body, query, param } from 'express-validator';

const router = Router();
const patientController = new PatientController();

// Validaciones para login
const loginValidations = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Password es requerido')
];

// Validaciones para citas
const appointmentValidations = [
  body('doctorId').isInt().withMessage('ID de doctor inválido'),
  body('date').isDate().withMessage('Fecha inválida'),
  body('hour').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora inválida')
];

// Rutas
router.post('/login', loginValidations, ValidationMiddleware.validate, patientController.login);

router.get('/appointment',
  AuthMiddleware.authenticate,
  query('date')
      .optional()
      .matches(/^\d{2}-\d{2}-\d{4}$/)
      .withMessage('El formato de fecha debe ser DD-MM-YYYY'),
  ValidationMiddleware.validate,
  patientController.getAppointments
);

router.post('/appointment',
  AuthMiddleware.authenticate,
  appointmentValidations,
  ValidationMiddleware.validate,
  patientController.createAppointment
);

router.put('/appointment/:appointmentId',
  AuthMiddleware.authenticate,
  appointmentValidations,
  param('appointmentId').isInt().withMessage('ID de cita inválido'),
  ValidationMiddleware.validate,
  patientController.updateAppointment
);

router.delete('/appointment/:appointmentId',
  AuthMiddleware.authenticate,
  param('appointmentId').isInt().withMessage('ID de cita inválido'),
  ValidationMiddleware.validate,
  patientController.deleteAppointment
);

export default router;