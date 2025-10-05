interface CategoryMenuProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryMenu({ categories, selectedCategory, onSelect }: CategoryMenuProps) {
  return (
    <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          style={{
            padding: "0.5rem 1rem",
            cursor: "pointer",
            backgroundColor: selectedCategory === cat ? "#055293" : "#8AA6BE",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
