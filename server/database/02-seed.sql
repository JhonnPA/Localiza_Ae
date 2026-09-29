-- Só as categorias. O gerente é criado com npm run create-manager
-- (a senha fica salva só como hash bcrypt).
-- As fotos ficam em public/categories/ (Unsplash).

INSERT INTO categories (name, price_per_day, stock, features, image_url) VALUES
  ('Econômico', 89.90, 10, '{"Ar-condicionado", "Direção hidráulica"}', '/categories/economico.jpg'),
  ('Sedan', 129.90, 8, '{"Ar-condicionado", "Câmbio automático", "Porta-malas amplo"}', '/categories/sedan.jpg'),
  ('SUV', 199.90, 6, '{"Ar-condicionado", "Câmbio automático", "7 lugares"}', '/categories/suv.jpg'),
  ('Luxo', 399.90, 3, '{"Câmbio automático", "Bancos de couro", "Teto solar"}', '/categories/luxo.jpg');
