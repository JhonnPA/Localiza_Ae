-- Tabelas do sistema. O Docker roda isso sozinho quando cria o banco
-- (só na primeira vez, com o volume vazio).

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'funcionario',
  active BOOLEAN NOT NULL DEFAULT true,
  -- senha provisória (definida pelo gerente) que o usuário tem que trocar no próximo login
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  -- sobe a cada troca de senha/desativação e invalida os tokens antigos
  token_version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cpf VARCHAR(20) UNIQUE NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price_per_day NUMERIC(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  features TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT
);

CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id),
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  pickup_time TIME,
  return_time TIME,
  pickup_location VARCHAR(100),
  return_location VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'Ativa'
);
