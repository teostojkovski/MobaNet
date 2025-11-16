"use client";

import Image from "next/image";
import styles from './dashboard.module.css';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CategoryConfigModal from "./components/CategoryConfigModal";

interface Category {
  id: number;
  name: string;
  value: number;
}

export default function Home() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalType, setCategoryModalType] = useState<"income" | "expense">("income");
  const [inputValue, setInputValue] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modalType, setModalType] = useState("add"); // "set", "add", "spending"

  const incomeTotal = incomeCategories.reduce((sum, cat) => sum + cat.value, 0);
  const expenseTotal = expenseCategories.reduce((sum, cat) => sum + cat.value, 0);

  useEffect(() => {
    fetchCategories();
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/balance");
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const [incomeRes, expenseRes] = await Promise.all([
        fetch("/api/income"),
        fetch("/api/expense"),
      ]);
      const incomeData = await incomeRes.json();
      const expenseData = await expenseRes.json();
      setIncomeCategories(incomeData);
      setExpenseCategories(expenseData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleBalanceChange = async () => {
    const amount = parseFloat(inputValue);
    if (isNaN(amount)) return;
    
    try {
      let transactionType = "SET_BALANCE";
      let transactionTitle = title;
      
      if (modalType === "set") {
        transactionTitle = "Balance set";
        setBalance(amount);
      } else if (modalType === "add") {
        transactionType = "ADD_BALANCE";
        if (!title) {
          alert("Title is required");
          return;
        }
        setBalance((prev) => prev + amount);
      } else if (modalType === "spending") {
        transactionType = "ADD_SPENDING";
        if (!title) {
          alert("Title is required");
          return;
        }
        setBalance((prev) => prev - amount);
      }

      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: transactionType,
          title: transactionTitle,
          description: description || null,
          amount,
          date: new Date().toISOString(),
        }),
      });

      setShowModal(false);
      setInputValue("");
      setTitle("");
      setDescription("");
      fetchBalance();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const openModal = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };

  const openCategoryModal = (type: "income" | "expense") => {
    setCategoryModalType(type);
    setShowCategoryModal(true);
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardHeading}>Welcome to the Dashboard</h1>
      <div className={styles.mainCard}>
        <div className={styles.balanceSection}>
          <h2>Total Balance</h2>
          <p>${balance.toFixed(2)}</p>
        </div>
        <div className={styles.incomeExpenseSection}>
          <div className={styles.income}>
            <div className={styles.incomeHeader}>
              <h2>Income</h2>
            </div>
            <div className={styles.incomeValueRow}>
              <p>${incomeTotal.toFixed(2)}</p>
              <button
                className={styles.monthlyIncomeButton}
                onClick={() => openCategoryModal("income")}
              >
                Monthly income
              </button>
            </div>
          </div>
          <div className={styles.expenses}>
            <div className={styles.incomeHeader}>
              <h2>Expenses</h2>
            </div>
            <div className={styles.incomeValueRow}>
              <p>${expenseTotal.toFixed(2)}</p>
              <button
                className={styles.monthlyExpenseButton}
                onClick={() => openCategoryModal("expense")}
              >
                Monthly expenses
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.buttonSection}>
        <button className={styles.addBalanceBtn} onClick={() => openModal("set")}>
          <span className={styles.icon}>⚙</span>
          Set Balance
        </button>
        <button className={styles.addIncomeBtn} onClick={() => openModal("add")}>
          <span className={styles.icon}>+</span>
          Add Balance
        </button>
        <button className={styles.addExpenseBtn} onClick={() => openModal("spending")}>
          <span className={styles.icon}>-</span>
          Add Spending
        </button>
      </div>
      <div className={styles.savingSection}>
        <div className={styles.savingContent}>
          <h2>Start Saving</h2>
          <p>Do not save what is left after spending, but spend what is left after saving. - Warren Buffett.</p>
        </div>
        <button className={styles.saveButton} onClick={() => router.push('/savings')}>
          <span className={styles.icon}>$</span>
          Start Saving
        </button>
      </div>
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>
              {modalType === "set" && "Set Balance"}
              {modalType === "add" && "Add Balance"}
              {modalType === "spending" && "Add Spending"}
            </h3>
            <p className={styles.modalDescription}>
              {modalType === "set" && "Enter the new balance amount"}
              {modalType === "add" && "Enter the amount to add to your current balance"}
              {modalType === "spending" && "Enter the amount you are spending"}
            </p>
            {modalType !== "set" && (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (required)"
                className={styles.modalInput}
              />
            )}
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Amount"
              className={styles.modalInput}
              step="0.01"
            />
            {modalType !== "set" && (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className={styles.modalTextarea}
                rows={3}
              />
            )}
            <div className={styles.modalButtons}>
              <button className={styles.confirmBtn} onClick={handleBalanceChange}>
                {modalType === "set" && "Set"}
                {modalType === "add" && "Add"}
                {modalType === "spending" && "Add Spending"}
              </button>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <CategoryConfigModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        type={categoryModalType}
        categories={categoryModalType === "income" ? incomeCategories : expenseCategories}
        onCategoriesChange={fetchCategories}
      />
    </div>
  );
}
