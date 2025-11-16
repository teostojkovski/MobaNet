"use client";

import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";

interface Transaction {
  id: number;
  type: string;
  title: string;
  description: string | null;
  amount: number;
  date: string;
  createdAt: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "day" | "month" | "year">("all");
  const [filterDate, setFilterDate] = useState("");
  const [discardModal, setDiscardModal] = useState<{ show: boolean; transaction: Transaction | null }>({
    show: false,
    transaction: null,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, filterType, filterDate]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      const data = await response.json();
      setTransactions(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }

    // Date filter
    if (filterType !== "all" && filterDate) {
      const filterDateObj = new Date(filterDate);
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        switch (filterType) {
          case "day":
            return (
              transactionDate.getFullYear() === filterDateObj.getFullYear() &&
              transactionDate.getMonth() === filterDateObj.getMonth() &&
              transactionDate.getDate() === filterDateObj.getDate()
            );
          case "month":
            return (
              transactionDate.getFullYear() === filterDateObj.getFullYear() &&
              transactionDate.getMonth() === filterDateObj.getMonth()
            );
          case "year":
            return transactionDate.getFullYear() === filterDateObj.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredTransactions(filtered);
  };

  const handleDiscardTransaction = async () => {
    if (!discardModal.transaction) return;

    try {
      await fetch(`/api/transactions/${discardModal.transaction.id}`, {
        method: "DELETE",
      });

      // Remove from local state
      setTransactions((prev) =>
        prev.filter((t) => t.id !== discardModal.transaction!.id)
      );

      setDiscardModal({ show: false, transaction: null });
    } catch (error) {
      console.error("Error discarding transaction:", error);
    }
  };

  const openDiscardModal = (transaction: Transaction) => {
    setDiscardModal({ show: true, transaction });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "SET_BALANCE":
        return "Set Balance";
      case "ADD_BALANCE":
        return "Add Balance";
      case "ADD_SPENDING":
        return "Add Spending";
      case "SAVE_TO_SAVINGS":
        return "Save to Savings";
      case "TAKE_FROM_SAVINGS":
        return "Take from Savings";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SET_BALANCE":
        return "#3b82f6";
      case "ADD_BALANCE":
        return "#10b981";
      case "ADD_SPENDING":
        return "#ef4444";
      case "SAVE_TO_SAVINGS":
        return "#8b5cf6";
      case "TAKE_FROM_SAVINGS":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <h1 className={styles.dashboardHeading}>Transactions</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardHeading}>Transactions</h1>
      
      <div className={styles.transactionsSearchContainer}>
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.filterContainer}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as "all" | "day" | "month" | "year")}
            className={styles.filterSelect}
          >
            <option value="all">All Time</option>
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
          {filterType !== "all" && (
            <input
              type={filterType === "year" ? "number" : filterType === "month" ? "month" : "date"}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className={styles.filterDateInput}
              placeholder={filterType === "year" ? "Year" : ""}
              min={filterType === "year" ? "2000" : undefined}
              max={filterType === "year" ? "2100" : undefined}
            />
          )}
        </div>
      </div>

      <div className={styles.transactionsContainer}>
        {filteredTransactions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>
              {searchQuery || filterType !== "all"
                ? "No transactions match your search criteria."
                : "No transactions yet. Start by adding a transaction from the dashboard."}
            </p>
          </div>
        ) : (
          <div className={styles.transactionsList}>
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className={styles.transactionCard}>
                <div className={styles.transactionHeader}>
                  <div className={styles.transactionTitleRow}>
                    <span
                      className={styles.transactionType}
                      style={{ backgroundColor: getTypeColor(transaction.type) }}
                    >
                      {getTypeLabel(transaction.type)}
                    </span>
                    <h3 className={styles.transactionTitle}>{transaction.title}</h3>
                  </div>
                  <div className={styles.transactionAmount}>
                    {transaction.type === "SET_BALANCE" 
                      ? (transaction.amount < 0 ? "-" : "") + "$" + Math.abs(transaction.amount).toFixed(2)
                      : transaction.type === "ADD_SPENDING" || transaction.type === "SAVE_TO_SAVINGS"
                      ? "-$" + Math.abs(transaction.amount).toFixed(2)
                      : "+$" + Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
                {transaction.description && (
                  <p className={styles.transactionDescription}>{transaction.description}</p>
                )}
                <div className={styles.transactionFooter}>
                  <span className={styles.transactionDate}>{formatDate(transaction.date)}</span>
                  <button
                    className={styles.discardButton}
                    onClick={() => openDiscardModal(transaction)}
                    title="Discard transaction"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {discardModal.show && (
        <div className={styles.modalOverlay} onClick={() => setDiscardModal({ show: false, transaction: null })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Discard Transaction</h3>
            <p className={styles.modalDescription}>
              Are you sure you want to revert this transaction? This will undo all changes it made to your balance, savings, and other fields. This action cannot be undone.
            </p>
            {discardModal.transaction && (
              <div className={styles.discardTransactionInfo}>
                <p><strong>Type:</strong> {getTypeLabel(discardModal.transaction.type)}</p>
                <p><strong>Title:</strong> {discardModal.transaction.title}</p>
                <p><strong>Amount:</strong> ${discardModal.transaction.amount.toFixed(2)}</p>
                <p><strong>Date:</strong> {formatDate(discardModal.transaction.date)}</p>
              </div>
            )}
            <div className={styles.modalButtons}>
              <button className={styles.discardConfirmBtn} onClick={handleDiscardTransaction}>
                Yes, Discard
              </button>
              <button className={styles.cancelBtn} onClick={() => setDiscardModal({ show: false, transaction: null })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
