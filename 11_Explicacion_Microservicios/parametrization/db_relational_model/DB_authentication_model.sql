-- Base de datos del microservicio de autenticacion (BACKEND_SRV_1).
--
-- Se ejecuta una vez con un usuario administrador, porque la cuenta de la
-- aplicacion (personal_manager) no puede crear bases de datos:
--
--   mysql -u root -p < parametrization/db_relational_model/DB_authentication_model.sql
--
-- La cuenta 'personal_manager'@'localhost' ya debe existir (README, paso 1.2).
-- El script se puede ejecutar varias veces: no borra ni duplica datos.

-- -----------------------------------------------------
-- Schema authentication
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `authentication` DEFAULT CHARACTER SET utf8mb4;

-- -----------------------------------------------------
-- Table `authentication`.`CUENTA`
--
-- password guarda "sal:hash":
--   sal  = 32 caracteres hexadecimales aleatorios, distintos en cada cuenta
--   hash = SHA2(CONCAT(sal, contrasenia), 256), 64 caracteres hexadecimales
-- Nunca se guarda la contrasenia en texto plano.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `authentication`.`CUENTA` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(97) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Permisos: el servicio de autenticacion solo necesita leer las cuentas
-- -----------------------------------------------------
GRANT SELECT ON `authentication`.* TO 'personal_manager'@'localhost';

-- -----------------------------------------------------
-- Cuenta de prueba
--   usuario:    admin
--   contrasenia: Admin123*
-- Cambie la contrasenia si la aplicacion sale de un entorno de practica.
--
-- Para crear mas cuentas, repita estas dos sentencias con otro usuario y clave.
-- INSERT IGNORE deja intacta la cuenta si el usuario ya existe.
-- -----------------------------------------------------
SET @sal = LOWER(HEX(RANDOM_BYTES(16)));

INSERT IGNORE INTO `authentication`.`CUENTA` (`username`, `password`)
VALUES ('admin', CONCAT(@sal, ':', SHA2(CONCAT(@sal, 'Admin123*'), 256)));
