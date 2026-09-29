import { pool } from "../db.js";

function toCategory(row) {
  return {
    id: row.id,
    name: row.name,
    pricePerDay: Number(row.price_per_day),
    stock: row.stock,
    features: row.features,
    imageUrl: row.image_url,
  };
}

export async function findAllCategories() {
  const { rows } = await pool.query("SELECT * FROM categories ORDER BY name");
  return rows.map(toCategory);
}
