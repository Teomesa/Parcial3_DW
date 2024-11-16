import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller.js';
import { AuthMiddleware } from '../middleware/auth.js';
import { ValidationMiddleware } from '../middleware/validator.js';
import { param, query } from 'express-validator';

const router = Router();
const doctorController = new DoctorController();

router.get('/:doctorId',
  param('doctorId').isInt().withMessage('ID de doctor inválido'),
  ValidationMiddleware.validate,
  doctorController.getDoctorById
);

router.get('/:doctorId/appointment',
  AuthMiddleware.authenticate,
  [
      param('doctorId').isInt().withMessage('ID de doctor inválido'),
      query('date')
          .optional()
          .matches(/^\d{2}-\d{2}-\d{4}$/)
          .withMessage('El formato de fecha debe ser DD-MM-YYYY')
  ],
  ValidationMiddleware.validate,
  doctorController.getDoctorAppointments
);

export default router;