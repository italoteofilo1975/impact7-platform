-- Dropar tabelas antigas
DROP TABLE IF EXISTS userRoles;
DROP TABLE IF EXISTS rolePermissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;

-- Criar tabelas com estrutura correta do Drizzle
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  level INT DEFAULT 0 NOT NULL,
  isActive INT DEFAULT 1 NOT NULL,
  createdAt BIGINT NOT NULL,
  updatedAt BIGINT NOT NULL
);

CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  isActive INT DEFAULT 1 NOT NULL,
  createdAt BIGINT NOT NULL,
  updatedAt BIGINT NOT NULL
);

CREATE TABLE rolePermissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roleId INT NOT NULL,
  permissionId INT NOT NULL,
  assignedAt BIGINT NOT NULL,
  UNIQUE KEY unique_role_permission (roleId, permissionId)
);

CREATE TABLE userRoles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  roleId INT NOT NULL,
  assignedAt BIGINT NOT NULL,
  UNIQUE KEY unique_user_role (userId, roleId)
);
