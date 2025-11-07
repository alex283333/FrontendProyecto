-- =====================================================
-- UltraFilm - Base de Datos MySQL
-- =====================================================
-- Este script crea todas las tablas necesarias para la aplicación
-- Ejecutar en MySQL/MariaDB con permisos de CREATE TABLE
-- =====================================================

-- Crear base de datos (opcional, descomentar si es necesario)
-- CREATE DATABASE IF NOT EXISTS ultrafilm_catalogo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE ultrafilm_catalogo;

-- =====================================================
-- TABLA: usuarios
-- =====================================================
-- Almacena información de los usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    verification_token_hash VARCHAR(255) NULL,
    verification_expires DATETIME NULL,
    last_verification_sent DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: jwt_blacklist
-- =====================================================
-- Almacena tokens JWT revocados para invalidarlos
CREATE TABLE IF NOT EXISTS jwt_blacklist (
    token VARCHAR(512) PRIMARY KEY,
    revocado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_revocado (revocado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: admin_activity
-- =====================================================
-- Registro de actividades administrativas
CREATE TABLE IF NOT EXISTS admin_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    admin_id INT NULL,
    admin_username VARCHAR(255) NULL,
    admin_email VARCHAR(255) NULL,
    admin_role VARCHAR(50) NULL,
    action VARCHAR(255) NULL,
    target_id INT NULL,
    target_username VARCHAR(255) NULL,
    target_email VARCHAR(255) NULL,
    details JSON NULL,
    message TEXT NULL,
    INDEX idx_ts (ts),
    INDEX idx_admin_id (admin_id),
    INDEX idx_target_id (target_id),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: favoritos
-- =====================================================
-- Favoritos de series por usuario
CREATE TABLE IF NOT EXISTS favoritos (
    user_id INT NOT NULL,
    serie_id INT NOT NULL,
    serie_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, serie_id),
    INDEX idx_user_id (user_id),
    INDEX idx_serie_id (serie_id),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: favoritos_peliculas
-- =====================================================
-- Favoritos de películas por usuario
CREATE TABLE IF NOT EXISTS favoritos_peliculas (
    user_id INT NOT NULL,
    pelicula_id INT NOT NULL,
    pelicula_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, pelicula_id),
    INDEX idx_user_id (user_id),
    INDEX idx_pelicula_id (pelicula_id),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: guardados
-- =====================================================
-- Series guardadas para ver más tarde por usuario
CREATE TABLE IF NOT EXISTS guardados (
    user_id INT NOT NULL,
    serie_id INT NOT NULL,
    serie_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, serie_id),
    INDEX idx_user_id (user_id),
    INDEX idx_serie_id (serie_id),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: guardados_peliculas
-- =====================================================
-- Películas guardadas para ver más tarde por usuario
CREATE TABLE IF NOT EXISTS guardados_peliculas (
    user_id INT NOT NULL,
    pelicula_id INT NOT NULL,
    pelicula_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, pelicula_id),
    INDEX idx_user_id (user_id),
    INDEX idx_pelicula_id (pelicula_id),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: todo
-- =====================================================
-- Lista de tareas por usuario (si se usa esta funcionalidad)
CREATE TABLE IF NOT EXISTS todo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NULL,
    completado TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_completado (completado),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice compuesto para búsquedas de usuarios por email y username
CREATE INDEX idx_user_search ON usuarios(username, email);

-- Índice para búsquedas de actividad por admin y fecha
CREATE INDEX idx_activity_admin_date ON admin_activity(admin_id, ts DESC);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

