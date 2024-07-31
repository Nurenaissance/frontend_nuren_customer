import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import './CoinStatsPage.css';
import TopNavbar from '../TopNavbar/TopNavbar';
import { Sidebar } from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../api';

const CoinStatsPage = () => {
  const [coinStats, setCoinStats] = useState({
    totalCoins: 0,
    recentTransactions: [],
    spendingCategories: [],
    coinHistory: []
  });

  const [showAddCoins, setShowAddCoins] = useState(false);
  const [coinAmount, setCoinAmount] = useState('');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  const userId = 3;

  useEffect(() => {
    fetchWalletBalance();
    fetchTransactions();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const response = await axiosInstance.get(`wallet/balance?user_id=${userId}`);
      setCoinStats(prevStats => ({ ...prevStats, totalCoins: response.data.balance }));
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axiosInstance.get(`wallet/transactions?user_id=${userId}&n=10`);
      const transactions = response.data.transactions.map(transaction => ({
        id: transaction.id,
        description: transaction.description,
        amount: parseFloat(transaction.amount),
        date: new Date(transaction.timestamp).toISOString().split('T')[0],
        category: transaction.amount >= 0 ? transaction.transaction_type : 'Purchase'
      }));
      setCoinStats(prevStats => ({ 
        ...prevStats, 
        recentTransactions: transactions 
      }));
      updateSpendingCategories(transactions);
      updateCoinHistory(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  


  const updateSpendingCategories = (transactions) => {
    const categories = {};
    transactions.forEach(transaction => {
      if (transaction.amount < 0) {
        const category = transaction.category === 'Purchase' ? transaction.description : transaction.category;
        categories[category] = (categories[category] || 0) + Math.abs(transaction.amount);
      }
    });
    const spendingCategories = Object.entries(categories).map(([category, value]) => ({ category, value }));
    setCoinStats(prevStats => ({ ...prevStats, spendingCategories }));
  };
  
  const updateCoinHistory = (transactions) => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let balance = coinStats.totalCoins;
    const coinHistory = sortedTransactions.map(transaction => {
      balance += transaction.amount;
      return { date: transaction.date, coins: balance };
    });
    setCoinStats(prevStats => ({ ...prevStats, coinHistory }));
  };
  

  const handleAddCoins = async () => {
    if (parseInt(coinAmount) >= 100) {
      try {
        await axiosInstance.post('wallet/recharge/', {
          amount: parseFloat(coinAmount),
          description: "Added coins",
          user_id: userId
        });
        fetchWalletBalance();
        fetchTransactions();
        setShowAddCoins(false);
        setCoinAmount('');
      } catch (error) {
        console.error('Error adding coins:', error);
        alert('Failed to add coins. Please try again.');
      }
    } else {
      alert("Minimum recharge amount is 100 coins");
    }
  };

  const filteredTransactions = coinStats.recentTransactions.filter(transaction => {
    const categoryMatch = filterCategory === 'All' || transaction.category === filterCategory;
    const dateMatch = (!filterDateFrom || transaction.date >= filterDateFrom) &&
                      (!filterDateTo || transaction.date <= filterDateTo);
    return categoryMatch && dateMatch;
  });

  return (
    <div>
      <div className="call_nav">
        <TopNavbar/>
      </div>
      <div className='coin-main-container'>
        <div className="home_left_box">
          <Sidebar />
        </div>
        <div className="coin-stats-container"> 
          <h1 className="page-title">Coin Stats</h1>
          <div className="coin-summary">
            <h2>Total Coins</h2>
            <div className="coin-count">{coinStats.totalCoins}</div>
            <button className="add-coins-btn" onClick={() => setShowAddCoins(true)}>Add More Coins</button>
          </div>

          {showAddCoins && (
            <div className="modal-overlay">
              <div className="add-coins-modal">
                <h3>Add Coins</h3>
                <input 
                  type="number" 
                  value={coinAmount} 
                  onChange={(e) => setCoinAmount(e.target.value)} 
                  placeholder="Enter coin amount"
                />
                <p>Minimum recharge amount is 100 coins</p>
                <div className="modal-buttons">
                  <button onClick={handleAddCoins}>Confirm</button>
                  <button onClick={() => setShowAddCoins(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="coin-details">
            <div className="recent-transactions">
              <h3>Recent Transactions</h3>
              <ul>
                {coinStats.recentTransactions.slice(0, 5).map((transaction) => (
                  <li key={transaction.id} className={transaction.amount > 0 ? 'positive' : 'negative'}>
                    <span className="transaction-description">{transaction.description}</span>
                    <span className="transaction-amount">{transaction.amount} coins</span>
                    <span className="transaction-date">{transaction.date}</span>
                  </li>
                ))}
              </ul>
              <button className="show-all-btn" onClick={() => setShowAllTransactions(true)}>Show All Transactions</button>
            </div>

            <div className="spending-breakdown">
              <h3>Spending Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={coinStats.spendingCategories}
      dataKey="value"
      nameKey="category"
      cx="50%"
      cy="50%"
      outerRadius={100}
      fill="#8884d8"
      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
      labelLine={true}
      animationBegin={0}
      animationDuration={1500}
    >
      {coinStats.spendingCategories.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend layout="vertical" align="right" verticalAlign="middle" />
  </PieChart>
</ResponsiveContainer>
            </div>
          </div>

          <div className="coin-history">
            <h3>Coin History</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={coinStats.coinHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="coins" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {showAllTransactions && (
            <div className="modal-overlay">
              <div className="all-transactions-modal">
                <h3>All Transactions</h3>
                <div className="filters">
                  <div className="filter-group">
                    <label>Category:</label>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
  <option value="All">All Categories</option>
  <option value="Recharge">Recharge</option>
  <option value="Purchase">Purchase</option>
  <option value="Reward">Reward</option>
  <option value="Referral">Referral</option>
</select>
                  </div>
                  <div className="filter-group">
                    <label>From:</label>
                    <input 
                      type="date" 
                      value={filterDateFrom} 
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label>To:</label>
                    <input 
                      type="date" 
                      value={filterDateTo} 
                      onChange={(e) => setFilterDateTo(e.target.value)}
                    />
                  </div>
                </div>
                <div className="transactions-list">
                  <ul>
                    {filteredTransactions.map((transaction) => (
                      <li key={transaction.id} className={transaction.amount >= 0 ? 'positive' : 'negative'}>
                      <span className="transaction-description">{transaction.description}</span>
                      <span className="transaction-amount">
                        {transaction.amount >= 0 ? '+' : '-'}{Math.abs(transaction.amount)} coins
                      </span>
                      <span className="transaction-date">{transaction.date}</span>
                      <span className="transaction-category">{transaction.category}</span>
                    </li>
                    ))}
                  </ul>
                </div>
                <button className="close-button" onClick={() => setShowAllTransactions(false)}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinStatsPage;
