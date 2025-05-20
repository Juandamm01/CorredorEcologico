CREATE DATABASE dbcorredor;
USE dbcorredor;


CREATE TABLE usuarios (
	id_usuario INT AUTO_INCREMENT PRIMARY KEY,
	nombre_completo VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    contraseña VARCHAR(100)
);

CREATE TABLE sugerencias (
	id_sugerencia INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    texto_sugerencia TEXT,
    calificacion DECIMAL(3,2)
);

CREATE TABLE calificaciones (
    id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
	FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_sugerencia INT,
	FOREIGN KEY (id_sugerencia) REFERENCES sugerencias(id_sugerencia) ON DELETE CASCADE,
    nota INT
);

DELIMITER $$
CREATE TRIGGER actualizar_promedio_calificacion
AFTER INSERT ON calificaciones
FOR EACH ROW
BEGIN
    DECLARE promedio DECIMAL(5,2);
    
    -- Calcula el promedio de todas las calificaciones para la sugerencia
    SELECT AVG(nota)
    INTO promedio
    FROM calificaciones
    WHERE id_sugerencia = NEW.id_sugerencia;
    
    -- Actualiza el promedio en la tabla sugerencias
    UPDATE sugerencias
    SET calificacion = promedio
    WHERE id_sugerencia = NEW.id_sugerencia;
END$$
DELIMITER ;

SELECT * FROM sugerencias WHERE id_usuario = 8;


SELECT * FROM usuarios;
SELECT * FROM sugerencias;
SELECT * FROM calificaciones;

DESCRIBE calificaciones;

set sql_safe_updates=0;