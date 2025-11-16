"use client";

import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";

interface Transaction {
  id: number;
  type: string;
  title: string;
  amount: number;
  date: string;
}

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    calculateReports();
  }, [transactions, filterMonth, filterYear]);

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

  const getFilteredTransactions = () => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const monthYear = `${year}-${month}`;

      if (filterMonth && filterYear) {
        return monthYear === `${filterYear}-${filterMonth}`;
      } else if (filterYear) {
        return year === filterYear;
      }
      return true;
    });
  };

  const calculateReports = () => {
    const filtered = getFilteredTransactions();
    // Reports will be calculated in render
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate metrics
  const monthlySpending = filteredTransactions
    .filter((t) => t.type === "ADD_SPENDING")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncome = filteredTransactions
    .filter((t) => t.type === "ADD_BALANCE")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavings = filteredTransactions
    .filter((t) => t.type === "SAVE_TO_SAVINGS")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavingsTaken = filteredTransactions
    .filter((t) => t.type === "TAKE_FROM_SAVINGS")
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = monthlySavings - monthlySavingsTaken;

  // Get previous period for comparison
  const getPreviousPeriod = () => {
    if (filterMonth && filterYear) {
      const monthNum = parseInt(filterMonth);
      const yearNum = parseInt(filterYear);
      if (monthNum === 1) {
        return { month: "12", year: (yearNum - 1).toString() };
      }
      return { month: (monthNum - 1).toString().padStart(2, "0"), year: filterYear };
    } else if (filterYear) {
      return { month: "", year: (parseInt(filterYear) - 1).toString() };
    }
    return { month: "", year: (new Date().getFullYear() - 1).toString() };
  };

  const previousPeriod = getPreviousPeriod();
  const previousTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");

    if (previousPeriod.month && previousPeriod.year) {
      return `${year}-${month}` === `${previousPeriod.year}-${previousPeriod.month}`;
    } else if (previousPeriod.year) {
      return year === previousPeriod.year;
    }
    return false;
  });

  const previousSavings = previousTransactions
    .filter((t) => t.type === "SAVE_TO_SAVINGS")
    .reduce((sum, t) => sum + t.amount, 0);
  const previousSavingsTaken = previousTransactions
    .filter((t) => t.type === "TAKE_FROM_SAVINGS")
    .reduce((sum, t) => sum + t.amount, 0);
  const previousNetSavings = previousSavings - previousSavingsTaken;

  const savingsIncreasePercent =
    previousNetSavings > 0
      ? ((netSavings - previousNetSavings) / previousNetSavings) * 100
      : netSavings > 0
      ? 100
      : 0;

  const averageDailySpending =
    filterMonth && filterYear
      ? monthlySpending / new Date(parseInt(filterYear), parseInt(filterMonth), 0).getDate()
      : monthlySpending / 365;

  const totalTransactions = filteredTransactions.length;
  const spendingTransactions = filteredTransactions.filter((t) => t.type === "ADD_SPENDING").length;
  const incomeTransactions = filteredTransactions.filter((t) => t.type === "ADD_BALANCE").length;

  const spendingPercentage = totalTransactions > 0 ? (spendingTransactions / totalTransactions) * 100 : 0;
  const incomePercentage = totalTransactions > 0 ? (incomeTransactions / totalTransactions) * 100 : 0;

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <h1 className={styles.dashboardHeading}>Reports</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.reportsHeader}>
        <h1 className={styles.dashboardHeading}>Financial Reports</h1>
        <div className={styles.reportsFilters}>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className={styles.filterSelect}
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month.toString().padStart(2, "0")}>
                {new Date(2000, month - 1).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.reportsMetricsGrid}>
        <div className={styles.metricCard}>
          <h3>Monthly Average Spending</h3>
          <p className={styles.metricValue}>${averageDailySpending.toFixed(2)}</p>
          <p className={styles.metricDescription}>
            {filterMonth && filterYear
              ? `Average daily spending for ${new Date(2000, parseInt(filterMonth) - 1).toLocaleString("default", { month: "long" })} ${filterYear}`
              : `Average daily spending for ${filterYear}`}
          </p>
        </div>

        <div className={styles.metricCard}>
          <h3>Savings Growth</h3>
          <p className={styles.metricValue}>
            {savingsIncreasePercent >= 0 ? "+" : ""}
            {savingsIncreasePercent.toFixed(1)}%
          </p>
          <p className={styles.metricDescription}>
            {savingsIncreasePercent >= 0 ? "Increase" : "Decrease"} compared to previous period
          </p>
        </div>

        <div className={styles.metricCard}>
          <h3>Total Income</h3>
          <p className={styles.metricValue}>${monthlyIncome.toFixed(2)}</p>
          <p className={styles.metricDescription}>
            Total income for the selected period
          </p>
        </div>

        <div className={styles.metricCard}>
          <h3>Total Spending</h3>
          <p className={styles.metricValue}>${monthlySpending.toFixed(2)}</p>
          <p className={styles.metricDescription}>
            Total spending for the selected period
          </p>
        </div>

        <div className={styles.metricCard}>
          <h3>Net Savings</h3>
          <p className={styles.metricValue}>${netSavings.toFixed(2)}</p>
          <p className={styles.metricDescription}>
            Savings added minus savings taken
          </p>
        </div>

        <div className={styles.metricCard}>
          <h3>Transaction Count</h3>
          <p className={styles.metricValue}>{totalTransactions}</p>
          <p className={styles.metricDescription}>
            {spendingTransactions} spending, {incomeTransactions} income transactions
          </p>
        </div>
      </div>

      <div className={styles.reportsChartsSection}>
        <div className={styles.chartCard}>
          <h2>Spending vs Income</h2>
          <div className={styles.barChart}>
            <div className={styles.barChartItem}>
              <div className={styles.barChartLabel}>Income</div>
              <div className={styles.barChartBarContainer}>
                <div
                  className={styles.barChartBar}
                  style={{
                    width: `${Math.min((monthlyIncome / Math.max(monthlyIncome, monthlySpending, 1)) * 100, 100)}%`,
                    backgroundColor: "#10b981",
                    minWidth: monthlyIncome > 0 ? "140px" : "0px",
                  }}
                >
                  <span className={styles.barChartValue}>${monthlyIncome.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className={styles.barChartItem}>
              <div className={styles.barChartLabel}>Spending</div>
              <div className={styles.barChartBarContainer}>
                <div
                  className={styles.barChartBar}
                  style={{
                    width: `${Math.min((monthlySpending / Math.max(monthlyIncome, monthlySpending, 1)) * 100, 100)}%`,
                    backgroundColor: "#ef4444",
                    minWidth: monthlySpending > 0 ? "140px" : "0px",
                  }}
                >
                  <span className={styles.barChartValue}>${monthlySpending.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.paydaySection}>
            <div className={styles.paydayCard}>
              <h3>Payday</h3>
              <p className={styles.paydayValue} style={{ color: monthlyIncome - monthlySpending >= 0 ? "#10b981" : "#ef4444" }}>
                ${(monthlyIncome - monthlySpending).toFixed(2)}
              </p>
              <p className={styles.paydayDescription}>
                {monthlyIncome - monthlySpending >= 0 
                  ? "You have more income than spending" 
                  : "You are spending more than your income"}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h2>Transaction Distribution</h2>
          <div className={styles.pieChartContainer}>
            <div className={styles.pieChart}>
              <div
                className={styles.pieSegment}
                style={{
                  background: `conic-gradient(#10b981 0% ${incomePercentage}%, #ef4444 ${incomePercentage}% ${incomePercentage + spendingPercentage}%, #e5e7eb ${incomePercentage + spendingPercentage}% 100%)`,
                }}
              ></div>
            </div>
            <div className={styles.pieChartLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: "#10b981" }}></span>
                <span>Income: {incomePercentage.toFixed(1)}%</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: "#ef4444" }}></span>
                <span>Spending: {spendingPercentage.toFixed(1)}%</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: "#e5e7eb" }}></span>
                <span>Other: {(100 - incomePercentage - spendingPercentage).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
