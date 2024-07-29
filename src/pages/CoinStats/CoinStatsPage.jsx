import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import './CoinStatsPage.css';
import TopNavbar from '../TopNavbar/TopNavbar';
import { Sidebar } from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const CoinStatsPage = () => {
    const navigate = useNavigate();
  const [coinStats, setCoinStats] = useState({
    totalCoins: 1500,
    recentTransactions: [
      { id: 1, description: "Purchased premium avatar", amount: -100, date: "2024-07-20", category: "Avatars" },
      { id: 2, description: "Completed weekly challenge", amount: 50, date: "2024-07-19", category: "Rewards" },
      { id: 3, description: "Referred a friend", amount: 200, date: "2024-07-18", category: "Referral" },
      { id: 4, description: "Bought power-up bundle", amount: -75, date: "2024-07-17", category: "Power-ups" },
      { id: 5, description: "Daily login bonus", amount: 10, date: "2024-07-16", category: "Rewards" },
    ],
    spendingCategories: [
      { category: "Avatars", value: 300 },
      { category: "Power-ups", value: 250 },
      { category: "Exclusive Content", value: 400 },
      { category: "Gifts", value: 150 },
      { category: "Others", value: 100 },
    ],
    coinHistory: [
      { date: '2024-07-15', coins: 1000 },
      { date: '2024-07-16', coins: 1100 },
      { date: '2024-07-17', coins: 1050 },
      { date: '2024-07-18', coins: 1300 },
      { date: '2024-07-19', coins: 1450 },
      { date: '2024-07-20', coins: 1500 },
    ]
  });

  const [showAddCoins, setShowAddCoins] = useState(false);
  const [coinAmount, setCoinAmount] = useState('');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];


  

  const handleAddCoins = () => {
    if (parseInt(coinAmount) >= 200) {
      setCoinStats(prevStats => ({
        ...prevStats,
        totalCoins: prevStats.totalCoins + parseInt(coinAmount),
        recentTransactions: [
          { id: Date.now(), description: "Added coins", amount: parseInt(coinAmount), date: new Date().toISOString().split('T')[0], category: "Recharge" },
          ...prevStats.recentTransactions
        ]
      }));
      setShowAddCoins(false);
      setCoinAmount('');
    } else {
      alert("Minimum recharge amount is 200 coins");
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
                <p>Minimum recharge amount is 200 coins</p>
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
                    outerRadius={80}
                    fill="#8884d8"
                    label
                    labelLine={false}
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {coinStats.spendingCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
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
                      <option value="Avatars">Avatars</option>
                      <option value="Power-ups">Power-ups</option>
                      <option value="Rewards">Rewards</option>
                      <option value="Referral">Referral</option>
                      <option value="Recharge">Recharge</option>
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
                      <li key={transaction.id} className={transaction.amount > 0 ? 'positive' : 'negative'}>
                        <span className="transaction-description">{transaction.description}</span>
                        <span className="transaction-amount">{transaction.amount} coins</span>
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