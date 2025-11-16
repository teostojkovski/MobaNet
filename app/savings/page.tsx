"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";

interface Transaction {
  id: number;
  type: string;
  title: string;
  description: string | null;
  amount: number;
  date: string;
}

export default function Savings() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [savings, setSavings] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTakeModal, setShowTakeModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [savingsTransactions, setSavingsTransactions] = useState<Transaction[]>([]);
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchSavings();
    fetchBalance();
  }, []);

  useEffect(() => {
    filterAndDisplayTransactions();
  }, [savingsTransactions, filterDate]);

  useEffect(() => {
    if (hasMore && displayedTransactions.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMoreTransactions();
          }
        },
        { threshold: 1.0 }
      );

      if (loadingRef.current) {
        observer.observe(loadingRef.current);
      }

      observerRef.current = observer;

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [displayedTransactions, hasMore]);

  const fetchSavings = async () => {
    try {
      const response = await fetch("/api/transactions");
      const data = await response.json();
      const savingsData = data.filter(
        (t: Transaction) => t.type === "SAVE_TO_SAVINGS" || t.type === "TAKE_FROM_SAVINGS"
      );
      setSavingsTransactions(savingsData.sort((a: Transaction, b: Transaction) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      const total = savingsData
        .filter((t: Transaction) => t.type === "SAVE_TO_SAVINGS")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      const taken = savingsData
        .filter((t: Transaction) => t.type === "TAKE_FROM_SAVINGS")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      setSavings(total - taken);
    } catch (error) {
      console.error("Error fetching savings:", error);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/balance");
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const filterAndDisplayTransactions = () => {
    let filtered = [...savingsTransactions];
    
    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getFullYear() === filterDateObj.getFullYear() &&
          transactionDate.getMonth() === filterDateObj.getMonth() &&
          transactionDate.getDate() === filterDateObj.getDate()
        );
      });
    }

    const initial = filtered.slice(0, ITEMS_PER_PAGE);
    setDisplayedTransactions(initial);
    setPage(1);
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  };

  const loadMoreTransactions = () => {
    let filtered = [...savingsTransactions];
    
    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getFullYear() === filterDateObj.getFullYear() &&
          transactionDate.getMonth() === filterDateObj.getMonth() &&
          transactionDate.getDate() === filterDateObj.getDate()
        );
      });
    }

    const nextPage = page + 1;
    const nextItems = filtered.slice(0, nextPage * ITEMS_PER_PAGE);
    setDisplayedTransactions(nextItems);
    setPage(nextPage);
    setHasMore(nextItems.length < filtered.length);
  };

  const handleAddToSavings = async () => {
    setErrorMessage("");
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage("Please enter a valid amount greater than 0.");
      return;
    }
    if (amountNum > balance) {
      setErrorMessage("You don't have enough balance to save this amount.");
      return;
    }

    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SAVE_TO_SAVINGS",
          title: "Add to savings",
          description: null,
          amount: amountNum,
          date: new Date().toISOString(),
        }),
      });

      setShowAddModal(false);
      setAmount("");
      setErrorMessage("");
      fetchSavings();
      fetchBalance();
    } catch (error) {
      console.error("Error saving to savings:", error);
      setErrorMessage("An error occurred while saving. Please try again.");
    }
  };

  const handleTakeFromSavings = async () => {
    setErrorMessage("");
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage("Please enter a valid amount greater than 0.");
      return;
    }
    if (amountNum > savings) {
      setErrorMessage("You don't have enough savings to take this amount.");
      return;
    }

    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TAKE_FROM_SAVINGS",
          title: "Take from savings",
          description: null,
          amount: amountNum,
          date: new Date().toISOString(),
        }),
      });

      setShowTakeModal(false);
      setAmount("");
      setErrorMessage("");
      fetchSavings();
      fetchBalance();
    } catch (error) {
      console.error("Error taking from savings:", error);
      setErrorMessage("An error occurred while taking from savings. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardHeading}>Saving</h1>
      
      <div className={styles.savingsCard}>
        <div className={styles.savingsHeaderRow}>
          <div className={styles.savingsBalanceSection}>
            <h2>Total Saved</h2>
            <p className={styles.savingsAmount}>${savings.toFixed(2)}</p>
          </div>
          <button
            className={styles.takeFromSavingsButton}
            onClick={() => setShowTakeModal(true)}
          >
            Take from savings
          </button>
        </div>
        <div className={styles.availableBalanceSection}>
          <h3>Available Balance</h3>
          <p>${balance.toFixed(2)}</p>
        </div>
        <button
          className={styles.addToSavingsButton}
          onClick={() => setShowAddModal(true)}
        >
          Add to Savings
        </button>
      </div>

      <div className={styles.savingsTransactionsContainer}>
        <div className={styles.savingsFilterRow}>
          <h2 className={styles.savingsSectionTitle}>Savings History</h2>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className={styles.filterDateInput}
            placeholder="Filter by date"
          />
        </div>
        {displayedTransactions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No savings transactions yet. Start saving now!</p>
          </div>
        ) : (
          <>
            <div className={styles.transactionsList}>
              {displayedTransactions.map((transaction) => (
                <div key={transaction.id} className={styles.transactionCard}>
                  <div className={styles.transactionHeader}>
                    <div className={styles.transactionTitleRow}>
                      <span
                        className={styles.transactionType}
                        style={{ backgroundColor: transaction.type === "SAVE_TO_SAVINGS" ? "#8b5cf6" : "#ef4444" }}
                      >
                        {transaction.type === "SAVE_TO_SAVINGS" ? "Add to savings" : "Take from savings"}
                      </span>
                      <h3 className={styles.transactionTitle}>{transaction.title}</h3>
                    </div>
                    <div className={styles.transactionAmount}>
                      {transaction.type === "SAVE_TO_SAVINGS" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className={styles.transactionFooter}>
                    <span className={styles.transactionDate}>{formatDate(transaction.date)}</span>
                  </div>
                </div>
              ))}
            </div>
            {hasMore && (
              <div ref={loadingRef} className={styles.loadingMore}>
                Loading more...
              </div>
            )}
          </>
        )}
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowAddModal(false); setErrorMessage(""); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Add to Savings</h3>
            <p className={styles.modalDescription}>
              Transfer money from your balance to savings
            </p>
            {errorMessage && (
              <div className={styles.errorMessage}>
                {errorMessage}
              </div>
            )}
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setErrorMessage(""); }}
              placeholder="Amount"
              className={styles.modalInput}
              step="0.01"
              max={balance}
            />
            <div className={styles.modalButtons}>
              <button className={styles.confirmBtn} onClick={handleAddToSavings}>
                Add to Savings
              </button>
              <button className={styles.cancelBtn} onClick={() => { setShowAddModal(false); setErrorMessage(""); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showTakeModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowTakeModal(false); setErrorMessage(""); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Take from Savings</h3>
            <p className={styles.modalDescription}>
              Transfer money from savings to your balance
            </p>
            {errorMessage && (
              <div className={styles.errorMessage}>
                {errorMessage}
              </div>
            )}
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setErrorMessage(""); }}
              placeholder="Amount"
              className={styles.modalInput}
              step="0.01"
              max={savings}
            />
            <div className={styles.modalButtons}>
              <button className={styles.confirmBtn} onClick={handleTakeFromSavings}>
                Take from Savings
              </button>
              <button className={styles.cancelBtn} onClick={() => { setShowTakeModal(false); setErrorMessage(""); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
