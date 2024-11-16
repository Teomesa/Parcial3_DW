TRUNCATE TABLE medicalappointment CASCADE;
TRUNCATE TABLE doctor CASCADE;
TRUNCATE TABLE patient CASCADE;
TRUNCATE TABLE specialty CASCADE;

-- Insertar las 5 especialidades
INSERT INTO specialty (name) VALUES 
    ('medicina general'),
    ('cardiología'),
    ('urología'),
    ('fisiología'),
    ('pediatría');

-- Insertar 5 médicos (contraseña: password123)
INSERT INTO doctor (name, age, email, password, specialty_id) VALUES 
    ('Dr. Santiago Pérez', 45, 'santiago.perez@hospital.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO', 1),
    ('Dra. Valentina Ruiz', 52, 'valentina.ruiz@hospital.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO', 2),
    ('Dr. Daniel López', 38, 'daniel.lopez@hospital.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO', 3),
    ('Dra. Isabella Martínez', 41, 'isabella.martinez@hospital.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO', 4),
    ('Dr. Mateo Restrepo', 36, 'mateo.restrepo@hospital.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO', 5);

-- Insertar 10 pacientes (contraseña: admin123)
INSERT INTO patient (name, age, email, password) VALUES 
    ('Ana María Gómez', 28, 'ana.gomez@email.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO'),
    ('Juan Pablo Mejía', 35, 'juan.mejia@email.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO'),
    ('Mariana Vélez', 42, 'mariana.velez@email.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO'),
    ('Sebastián Torres', 19, 'sebastian.torres@email.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO'),
    ('Laura Ochoa', 31, 'laura.ochoa@email.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO'),
    ('Carlos Hernández', 45, 'carlos.hernandez@email.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO'),
    ('María José Díaz', 27, 'maria.diaz@email.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO'),
    ('Andrés Felipe Ríos', 33, 'andres.rios@email.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO'),
    ('Camila Andrea Soto', 29, 'camila.soto@email.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO'),
    ('David Alejandro Castro', 38, 'david.castro@email.com', '$2a$10$zOqBTgbXFtbBX.KE1amYWu1iR3Guqg6sFOPESEkIpgt406imL67jO');

-- Insertar algunas citas de ejemplo
INSERT INTO medicalappointment (date, hour, patient_id, doctor_id) VALUES 
    ('2024-11-20', '09:00', 1, 1),
    ('2024-11-20', '10:00', 2, 2),
    ('2024-11-20', '11:00', 3, 3);