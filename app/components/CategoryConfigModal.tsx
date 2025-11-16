"use client";

import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";

interface Category {
  id: number;
  name: string;
  value: number;
}

interface CategoryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "income" | "expense";
  categories: Category[];
  onCategoriesChange: () => void;
}

export default function CategoryConfigModal({
  isOpen,
  onClose,
  type,
  categories,
  onCategoriesChange,
}: CategoryConfigModalProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryValue, setNewCategoryValue] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddCategory = async () => {
    if (!newCategoryName || !newCategoryValue) return;

    try {
      const response = await fetch(`/api/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName,
          value: parseFloat(newCategoryValue),
        }),
      });

      if (response.ok) {
        setNewCategoryName("");
        setNewCategoryValue("");
        onCategoriesChange();
      }
    } catch (error) {
      console.error(`Error adding ${type} category:`, error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName || !newCategoryValue) return;

    try {
      const response = await fetch(`/api/${type}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCategory.id,
          name: newCategoryName,
          value: parseFloat(newCategoryValue),
        }),
      });

      if (response.ok) {
        setEditingCategory(null);
        setNewCategoryName("");
        setNewCategoryValue("");
        onCategoriesChange();
      }
    } catch (error) {
      console.error(`Error updating ${type} category:`, error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const response = await fetch(`/api/${type}?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onCategoriesChange();
      }
    } catch (error) {
      console.error(`Error deleting ${type} category:`, error);
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryValue(category.value.toString());
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setNewCategoryName("");
    setNewCategoryValue("");
  };

  const total = categories.reduce((sum, cat) => sum + cat.value, 0);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.categoryModal} onClick={(e) => e.stopPropagation()}>
        <h3>Configure {type === "income" ? "Income" : "Expense"} Categories</h3>
        
        <div className={styles.categoryForm}>
          <input
            type="text"
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className={styles.modalInput}
          />
          <input
            type="number"
            placeholder="Value"
            value={newCategoryValue}
            onChange={(e) => setNewCategoryValue(e.target.value)}
            className={styles.modalInput}
            step="0.01"
          />
          <div className={styles.modalButtons}>
            {editingCategory ? (
              <>
                <button className={styles.confirmBtn} onClick={handleUpdateCategory}>
                  Update
                </button>
                <button className={styles.cancelBtn} onClick={cancelEdit}>
                  Cancel
                </button>
              </>
            ) : (
              <button className={styles.confirmBtn} onClick={handleAddCategory}>
                Add Category
              </button>
            )}
          </div>
        </div>

        <div className={styles.categoryList}>
          {categories.map((category) => (
            <div key={category.id} className={styles.categoryItem}>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categoryValue}>${category.value.toFixed(2)}</span>
              </div>
              <div className={styles.categoryActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => startEdit(category)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.categoryTotal}>
          <strong>Total: ${total.toFixed(2)}</strong>
        </div>

        <button className={styles.cancelBtn} onClick={onClose} style={{ marginTop: "16px", width: "100%" }}>
          Close
        </button>
      </div>
    </div>
  );
}

