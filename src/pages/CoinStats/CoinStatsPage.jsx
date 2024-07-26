import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './CoinStatsPage.css';

const CoinStatsPage = () => {
  const [coinStats, setCoinStats] = useState({
    totalCoins: 0,
    recentTransactions: [],
    spendingCategories: []
  });

  useEffect(() => {
    fetchCoinStats();
  }, []);

  const fetchCoinStats = async () => {
    try {
      const response = await axiosInstance.get('/user/coin-stats');
      setCoinStats(response.data);
    } catch (error) {
      console.error('Error fetching coin stats:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="coin-stats-container">
      <h1>Coin Stats</h1>
      
      <div className="coin-summary">
        <h2>Total Coins: {coinStats.totalCoins}</h2>
      </div>

      <div className="coin-details">
        <div className="recent-transactions">
          <h3>Recent Transactions</h3>
          <ul>
            {coinStats.recentTransactions.map((transaction, index) => (
              <li key={index}>
                {transaction.description}: {transaction.amount} coins
              </li>
            ))}
          </ul>
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
    </div>
  );
};

export default CoinStatsPage;