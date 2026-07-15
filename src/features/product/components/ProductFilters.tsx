import { Dropdown } from "../../../shared/components/Dropdown";
import { Input } from "../../../shared/components/Input";
import type { DropdownOption } from "../../../shared/components/Dropdown";

interface ProductFiltersProps {
  name: string;
  type: string;
  brand: string;
  typeOptions: DropdownOption[];
  brandOptions: DropdownOption[];
  onNameChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export function ProductFilters({
  name,
  type,
  brand,
  typeOptions,
  brandOptions,
  onNameChange,
  onTypeChange,
  onBrandChange,
  onApply,
  onClear,
}: ProductFiltersProps) {
  return (
    <section className="mb-10 border border-input bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Nombre"
          name="filter-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Buscar por nombre"
        />
        <Dropdown
          label="Tipo de producto"
          options={typeOptions}
          value={type}
          onChange={onTypeChange}
          placeholder="Todos los tipos"
        />
        <Dropdown
          label="Marca"
          options={brandOptions}
          value={brand}
          onChange={onBrandChange}
          placeholder="Todas las marcas"
        />
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onClear}
          className="flex h-12 items-center justify-center border border-foreground bg-background px-6 text-sm font-bold uppercase tracking-wider text-foreground transition hover:bg-muted active:scale-95"
        >
          Limpiar filtros
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex h-12 items-center justify-center gap-2 bg-primary px-6 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover active:scale-95"
        >
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="h-4 w-4"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 01.8 1.6l-4.3 5.4V16a1 1 0 01-1.45.9l-2-1A1 1 0 018 15v-4l-4.3-5.4A1 1 0 014.5 4H4a1 1 0 01-1-1zm1 0h12l-4 5v5l-2 1v-6L7 5H4z"
              clipRule="evenodd"
            />
          </svg>
          Filtrar
        </button>
      </div>
    </section>
  );
}