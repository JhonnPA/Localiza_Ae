-- Dados de exemplo pra testar o sistema (npm run demo-data).
-- As datas são relativas ao dia em que o script roda (CURRENT_DATE + n dias),
-- então as reservas ativas sempre ficam perto de hoje.

INSERT INTO clients (name, cpf, phone, email, active) VALUES
  ('Ana Paula Ribeiro', '529.982.247-25', '(67) 99812-4410', 'ana.ribeiro@email.com', true),
  ('Bruno Carvalho', '111.444.777-35', '(67) 99155-0921', 'bruno.carvalho@email.com', true),
  ('Carla Mendes', '390.533.447-05', '(67) 98433-7765', 'carla.mendes@email.com', true),
  ('Diego Nascimento', '714.602.380-01', '(67) 99270-1183', 'diego.n@email.com', true),
  ('Eduarda Lima', '853.513.468-93', '(67) 99640-3302', 'eduarda.lima@email.com', true),
  ('Felipe Souza', '248.438.034-80', '(67) 98107-5594', 'felipe.souza@email.com', true),
  ('Gabriela Rocha', '606.707.212-94', '(67) 99388-6617', 'gabi.rocha@email.com', true),
  ('Henrique Alves', '072.176.570-01', '(67) 99921-4078', 'henrique.alves@email.com', false);

INSERT INTO reservations (
  client_id, category_id, pickup_date, return_date, pickup_time,
  return_time, pickup_location, return_location, status
)
SELECT client.id, category.id, CURRENT_DATE + demo.pickup_in, CURRENT_DATE + demo.return_in,
       demo.pickup_time::time, demo.return_time::time, demo.pickup_location,
       demo.return_location, demo.status
  FROM (VALUES
    -- ativas: em andamento ou começando nos próximos dias
    ('529.982.247-25', 'SUV',       -2,   3, '09:00', '18:00', 'Aeroporto', 'Aeroporto', 'Ativa'),
    ('111.444.777-35', 'Econômico', -1,   1, '08:30', '17:00', 'Matriz',    'Centro',    'Ativa'),
    ('390.533.447-05', 'Luxo',       0,   2, '10:00', '10:00', 'Centro',    'Centro',    'Ativa'),
    ('714.602.380-01', 'Sedan',      2,   6, '14:00', '12:00', 'Matriz',    'Matriz',    'Ativa'),
    ('853.513.468-93', 'Econômico',  5,   9, NULL,    NULL,    'Aeroporto', 'Matriz',    'Ativa'),
    ('248.438.034-80', 'SUV',        7,  14, '07:00', '19:00', 'Matriz',    'Aeroporto', 'Ativa'),
    -- concluídas ao longo do ano
    ('529.982.247-25', 'Sedan',    -15, -12, '09:00', '09:00', 'Matriz',    'Matriz',    'Concluída'),
    ('606.707.212-94', 'Econômico', -40, -35, '11:00', '16:00', 'Centro',   'Centro',    'Concluída'),
    ('111.444.777-35', 'Luxo',     -70, -68, '18:00', '18:00', 'Aeroporto', 'Aeroporto', 'Concluída'),
    ('390.533.447-05', 'SUV',     -100, -93, '08:00', '20:00', 'Matriz',    'Aeroporto', 'Concluída'),
    ('714.602.380-01', 'Econômico', -130, -127, '09:30', '09:30', 'Centro', 'Matriz',    'Concluída'),
    ('853.513.468-93', 'Sedan',   -160, -155, NULL,    NULL,    'Matriz',    'Matriz',    'Concluída'),
    ('072.176.570-01', 'SUV',     -190, -184, '10:00', '15:00', 'Aeroporto', 'Centro',    'Concluída'),
    ('606.707.212-94', 'Luxo',    -220, -217, '12:00', '12:00', 'Centro',    'Centro',    'Concluída'),
    -- canceladas (não entram no faturamento)
    ('248.438.034-80', 'Luxo',     -50, -45, '09:00', '09:00', 'Matriz',    'Matriz',    'Cancelada'),
    ('072.176.570-01', 'Econômico', -20, -18, '13:00', '13:00', 'Centro',   'Centro',    'Cancelada'),
    -- ano passado, pra testar a troca de ano nos relatórios
    ('529.982.247-25', 'Sedan',   -300, -296, '09:00', '09:00', 'Matriz',    'Matriz',    'Concluída'),
    ('111.444.777-35', 'SUV',     -330, -325, '08:00', '18:00', 'Aeroporto', 'Aeroporto', 'Concluída')
  ) AS demo (cpf, category_name, pickup_in, return_in, pickup_time, return_time,
             pickup_location, return_location, status)
  JOIN clients client ON client.cpf = demo.cpf
  JOIN categories category ON category.name = demo.category_name;
