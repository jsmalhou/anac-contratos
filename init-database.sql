-- Script para criar a base de dados ANAC Contratos
-- Execute no MySQL: mysql -u root -p < init-database.sql

CREATE DATABASE IF NOT EXISTS anac_contratos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE anac_contratos;

-- Verificar se foi criada
SHOW DATABASES LIKE 'anac_contratos';
