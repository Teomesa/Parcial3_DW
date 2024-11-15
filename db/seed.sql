-- Insertar especialidades
INSERT INTO specialty (name) VALUES 
    ('medicina general'),
    ('cardiología'),
    ('urología'),
    ('pediatría');

-- Insertar doctores (uno por cada especialidad)
-- Contraseña: password123 para todos los doctores
INSERT INTO doctor (name, age, email, password, specialty_id) VALUES 
    ('Dr. Juan Pérez', 45, 'juan.perez@hospital.com', '$2b$10$vMEMpi.o4gT6YmBxdHwHqOhzIzJ3k7/aP7WgUXZO4sF2MJy3mXKZK', 1),  -- Medicina general
    ('Dr. Carlos Ruiz', 52, 'carlos.ruiz@hospital.com', '$2b$10$vMEMpi.o4gT6YmBxdHwHqOhzIzJ3k7/aP7WgUXZO4sF2MJy3mXKZK', 2),  -- Cardiología
    ('Dra. María López', 38, 'maria.lopez@hospital.com', '$2b$10$vMEMpi.o4gT6YmBxdHwHqOhzIzJ3k7/aP7WgUXZO4sF2MJy3mXKZK', 3),  -- Urología
    ('Dra. Ana Martínez', 41, 'ana.martinez@hospital.com', '$2b$10$vMEMpi.o4gT6YmBxdHwHqOhzIzJ3k7/aP7WgUXZO4sF2MJy3mXKZK', 4);  -- Pediatría

-- Insertar pacientes específicos
-- Contraseña: password123 para todos los pacientes
INSERT INTO patient (name, age, email, password) VALUES 
    ('Mateo', 22, 'mateo@email.com', '$2b$10$vMEMpi.o4gT6YmBxdHwHqOhzIzJ3k7/aP7WgUXZO4sF2MJy3mXKZK'),
    ('Carlos', 25, 'carlos@email.com', '$2b$10$vMEMpi.o4gT6YmBxdHwHqOhzIzJ3k7/aP7WgUXZO4sF2MJy3mXKZK'),
    ('Emanuel', 33, 'emanuel@email.com', '$2b$10$vMEMpi.o4gT6YmBxdHwHqOhzIzJ3k7/aP7WgUXZO4sF2MJy3mXKZK'),
    ('Sebastian', 19, 'sebastian@email.com', '$2b$10$vMEMpi.o4gT6YmBxdHwHqOhzIzJ3k7/aP7WgUXZO4sF2MJy3mXKZK'),
    ('Juan', 28, 'juan@email.com', '$2b$10$vMEMpi.o4gT6YmBxdHwHqOhzIzJ3k7/aP7WgUXZO4sF2MJy3mXKZK'),
    ('Sandra', 19, 'sandra@email.com', '$2b$10$vMEMpi.o4gT6YmBxdHwHqOhzIzJ3k7/aP7WgUXZO4sF2MJy3mXKZK');

-- Insertar algunas citas de ejemplo (opcional)
INSERT INTO medicalappointment (date, hour, patient_id, doctor_id) VALUES 
    ('2024-11-20', '09:00', 1, 1),  -- Cita de Mateo con médico general
    ('2024-11-20', '10:00', 2, 2),  -- Cita de Carlos con cardiólogo
    ('2024-11-20', '11:00', 3, 3);  -- Cita de Emanuel con urólogo