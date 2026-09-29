import { Car } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { countAvailableCarsByCategory } from "../domain/inventory";
import type { Category } from "../domain/types";
import { ROUTES } from "../routes";
import { useAppStore } from "../store/useAppStore";
import { formatCurrency } from "../utils/format";

const PLACEHOLDER_ICON_SIZE = 64;

function CategoryImage({ category }: { category: Category }) {
  if (!category.imageUrl) {
    return (
      <div className="grid h-48 place-items-center bg-surface-muted text-subtle">
        <Car size={PLACEHOLDER_ICON_SIZE} />
      </div>
    );
  }
  return (
    <img
      src={category.imageUrl}
      alt={`Carro da categoria ${category.name}`}
      className="h-48 w-full object-cover"
    />
  );
}

export default function CategoriesPage() {
  const navigate = useNavigate();
  const categories = useAppStore((state) => state.categories);
  const reservations = useAppStore((state) => state.reservations);
  const selectCategory = useAppStore((state) => state.selectCategory);

  const availableCarsByCategory = countAvailableCarsByCategory(categories, reservations);
  const categoriesByPrice = [...categories].sort((a, b) => a.pricePerDay - b.pricePerDay);

  const handleSelectCategory = (categoryId: number) => {
    selectCategory(categoryId);
    navigate(ROUTES.NEW_RESERVATION);
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold text-link">Categorias</h2>
      <p className="mb-6 text-subtle">Escolha a categoria ideal</p>
      <div className="grid gap-6 lg:grid-cols-3">
        {categoriesByPrice.map((category) => (
          <div key={category.id} className="card overflow-hidden">
            <CategoryImage category={category} />
            <div className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <span className="rounded-md bg-brand-yellow/30 px-2 py-1 text-sm text-content">
                  {availableCarsByCategory.get(category.id)} disponíveis
                </span>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(category.pricePerDay)}</div>
              <div className="text-sm text-muted">por dia</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {category.features.map((feature) => (
                  <span key={feature} className="badge bg-surface-muted">
                    {feature}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleSelectCategory(category.id)}
                className="btn btn-primary mt-2 w-full"
              >
                Selecionar Categoria
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
