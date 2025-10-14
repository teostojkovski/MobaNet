"use client";

import Image from "next/image";
import styles from './dashboard.module.css';
import { use, useState } from "react";

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [modalType, setModalType] = useState("add"); // "set", "add", "subtract"

  const handleBalanceChange = () => {
    const amount = parseFloat(inputValue);
    if (isNaN(amount)) return;
    
    if (modalType === "set") {
      setBalance(amount);
    } else if (modalType === "add") {
      setBalance((prev) => prev + amount);
    } else if (modalType === "subtract") {
      setBalance((prev) => prev - amount);
    }
    
    setShowModal(false);
    setInputValue("");
  };

  const openModal = (type: string) => {
    setModalType(type);
    setShowModal(true);
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
            <h2>Income</h2>
            <p>$8,000.00</p>
          </div>
          <div className={styles.expenses}>
            <h2>Expenses</h2>
            <p>$5,432.10</p>
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
          <button className={styles.addExpenseBtn} onClick={() => openModal("subtract")}>
            <span className={styles.icon}>-</span>
            Subtract Balance
          </button>
        </div>
      <div className={styles.savingSection}>
        <div className={styles.savingContent}>
          <h2>Start Saving</h2>
          <p>Start saving on our precisely reported and expertly managed app, designed to help you track your progress, make informed decisions, and achieve your financial goals with ease.
             Do not save what is left after spending, but spend what is left after saving. - Warren Buffett.</p>
        </div>
        <button className={styles.saveButton}>
          <span className={styles.icon}>$</span>
          Start Saving
        </button>
      </div>
       {showModal && (
         <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
           <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
             <h3>
               {modalType === "set" && "Set Balance"}
               {modalType === "add" && "Add to Balance"}
               {modalType === "subtract" && "Subtract from Balance"}
             </h3>
             <p className={styles.modalDescription}>
               {modalType === "set" && "Enter the new balance amount"}
               {modalType === "add" && "Enter the amount to add to your current balance"}
               {modalType === "subtract" && "Enter the amount to subtract from your current balance"}
             </p>
             <input
               type="number"
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               placeholder="Enter amount"
               className={styles.modalInput}
             />
             <div className={styles.modalButtons}>
               <button className={styles.confirmBtn} onClick={handleBalanceChange}>
                 {modalType === "set" && "Set"}
                 {modalType === "add" && "Add"}
                 {modalType === "subtract" && "Subtract"}
               </button>
               <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
