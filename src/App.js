import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './App.css';

function App() {
  const [selectedMonth, setSelectedMonth] = useState(9); // October (0-indexed)
  const [selectedYear, setSelectedYear] = useState(2025);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Initialize with stored data or defaults
  const [monthlyData, setMonthlyData] = useState(() => {
    const stored = localStorage.getItem('moneyLodgeData');
    return stored ? JSON.parse(stored) : {};
  });

  const currentKey = `${selectedYear}-${selectedMonth}`;
  const currentData = monthlyData[currentKey] || {
    income: [],
    expenses: [],
    debts: [],
    bills: [],
    budgetCategories: [
      { category: 'Housing', planned: 0, actual: 0 },
      { category: 'Transportation', planned: 0, actual: 0 },
      { category: 'Food', planned: 0, actual: 0 },
      { category: 'Utilities', planned: 0, actual: 0 },
      { category: 'Entertainment', planned: 0, actual: 0 },
      { category: 'Savings', planned: 0, actual: 0 },
      { category: 'Other', planned: 0, actual: 0 }
    ],
    savingsGoal: 20
  };

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('moneyLodgeData', JSON.stringify(monthlyData));
  }, [monthlyData]);

  const updateCurrentData = (updates) => {
    setMonthlyData(prev => ({
      ...prev,
      [currentKey]: { ...currentData, ...updates }
    }));
  };

  // Financial calculations
  const totalIncome = currentData.income.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalExpenses = currentData.expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalDebts = currentData.debts.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0);
  const totalBills = currentData.bills.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const monthlyDebtPayments = currentData.debts.reduce((sum, item) => sum + parseFloat(item.monthlyPayment || 0), 0);
  
  const savingsAmount = (totalIncome * currentData.savingsGoal) / 100;
  const remainingAfterSavings = totalIncome - savingsAmount;
  const remainingAfterExpenses = totalIncome - totalExpenses;
  const remainingAfterBills = remainingAfterExpenses - totalBills;
  const remainingAfterDebts = remainingAfterBills - monthlyDebtPayments;
  const netCashFlow = totalIncome - totalExpenses - totalBills - monthlyDebtPayments;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const addIncome = () => {
    updateCurrentData({
      income: [...currentData.income, { source: '', amount: 0, date: new Date().toISOString().split('T')[0] }]
    });
  };

  const updateIncome = (index, field, value) => {
    const newIncome = [...currentData.income];
    newIncome[index][field] = value;
    updateCurrentData({ income: newIncome });
  };

  const deleteIncome = (index) => {
    updateCurrentData({
      income: currentData.income.filter((_, i) => i !== index)
    });
  };

  const addExpense = () => {
    updateCurrentData({
      expenses: [...currentData.expenses, { description: '', amount: 0, category: '', date: new Date().toISOString().split('T')[0] }]
    });
  };

  const updateExpense = (index, field, value) => {
    const newExpenses = [...currentData.expenses];
    newExpenses[index][field] = value;
    updateCurrentData({ expenses: newExpenses });
  };

  const deleteExpense = (index) => {
    updateCurrentData({
      expenses: currentData.expenses.filter((_, i) => i !== index)
    });
  };

  const addDebt = () => {
    updateCurrentData({
      debts: [...currentData.debts, { name: '', balance: 0, interestRate: 0, monthlyPayment: 0, dueDate: '' }]
    });
  };

  const updateDebt = (index, field, value) => {
    const newDebts = [...currentData.debts];
    newDebts[index][field] = value;
    updateCurrentData({ debts: newDebts });
  };

  const deleteDebt = (index) => {
    updateCurrentData({
      debts: currentData.debts.filter((_, i) => i !== index)
    });
  };

  const addBill = () => {
    updateCurrentData({
      bills: [...currentData.bills, { name: '', amount: 0, dueDate: '', recurring: true }]
    });
  };

  const updateBill = (index, field, value) => {
    const newBills = [...currentData.bills];
    newBills[index][field] = value;
    updateCurrentData({ bills: newBills });
  };

  const deleteBill = (index) => {
    updateCurrentData({
      bills: currentData.bills.filter((_, i) => i !== index)
    });
  };

  const updateBudgetCategory = (index, field, value) => {
    const newCategories = [...currentData.budgetCategories];
    newCategories[index][field] = parseFloat(value) || 0;
    updateCurrentData({ budgetCategories: newCategories });
  };

  const pieChartData = [
    { name: 'Expenses', value: totalExpenses, color: '#FFD700' },
    { name: 'Bills', value: totalBills, color: '#DAA520' },
    { name: 'Debt Payments', value: monthlyDebtPayments, color: '#B8860B' },
    { name: 'Remaining', value: Math.max(0, netCashFlow), color: '#1a1a1a' }
  ].filter(item => item.value > 0);

  return (
    <div className="app-container">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="app-title">💰 MONEY LODGE</h1>
        <p className="app-subtitle">by Empire Domination</p>
      </div>

      {/* Month/Year Selector */}
      <div className="card mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Select Month:</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="input"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Select Year:</label>
            <input 
              type="number" 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input"
            />
          </div>
        </div>
        <div className="mt-4 text-center">
          <h2 className="current-month">
            {months[selectedMonth]} {selectedYear}
          </h2>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        {['overview', 'income', 'expenses', 'debts', 'bills', 'budget', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? 'tab-active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">${totalIncome.toFixed(2)}</div>
              <div className="metric-label">Total Income</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">${totalExpenses.toFixed(2)}</div>
              <div className="metric-label">Total Expenses</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">${netCashFlow.toFixed(2)}</div>
              <div className="metric-label">Net Cash Flow</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">${totalDebts.toFixed(2)}</div>
              <div className="metric-label">Total Debt Balance</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="card">
              <h3 className="section-title">Financial Breakdown</h3>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <span>Total Income:</span>
                  <span className="font-bold">${totalIncome.toFixed(2)}</span>
                </div>
                <div className="breakdown-item">
                  <span>- Total Expenses:</span>
                  <span className="font-bold">-${totalExpenses.toFixed(2)}</span>
                </div>
                <div className="breakdown-item">
                  <span>- Upcoming Bills:</span>
                  <span className="font-bold">-${totalBills.toFixed(2)}</span>
                </div>
                <div className="breakdown-item">
                  <span>- Debt Payments:</span>
                  <span className="font-bold">-${monthlyDebtPayments.toFixed(2)}</span>
                </div>
                <div className="breakdown-item-total">
                  <span className="font-bold">Remaining:</span>
                  <span className="font-bold" style={{ color: remainingAfterDebts >= 0 ? '#00FF00' : '#FF0000' }}>
                    ${remainingAfterDebts.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="section-title">Savings Calculator</h3>
              <div className="mb-4">
                <label className="label">Savings Goal (% of Income):</label>
                <input 
                  type="number" 
                  value={currentData.savingsGoal}
                  onChange={(e) => updateCurrentData({ savingsGoal: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  className="input"
                />
              </div>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <span>Recommended Savings ({currentData.savingsGoal}%):</span>
                  <span className="font-bold">${savingsAmount.toFixed(2)}</span>
                </div>
                <div className="breakdown-item">
                  <span>Available After Savings:</span>
                  <span className="font-bold">${remainingAfterSavings.toFixed(2)}</span>
                </div>
                <div className="breakdown-item">
                  <span>Debt-to-Income Ratio:</span>
                  <span className="font-bold">
                    {totalIncome > 0 ? ((monthlyDebtPayments / totalIncome) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">Income Sources</h3>
            <button onClick={addIncome} className="add-button">+ Add Income</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.income.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input 
                        type="text" 
                        value={item.source}
                        onChange={(e) => updateIncome(index, 'source', e.target.value)}
                        placeholder="e.g., Salary, Freelance"
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={item.amount}
                        onChange={(e) => updateIncome(index, 'amount', e.target.value)}
                        placeholder="0.00"
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="date" 
                        value={item.date}
                        onChange={(e) => updateIncome(index, 'date', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <button className="delete-button" onClick={() => deleteIncome(index)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="total-text">Total Income: ${totalIncome.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">Expenses</h3>
            <button onClick={addExpense} className="add-button">+ Add Expense</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.expenses.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => updateExpense(index, 'description', e.target.value)}
                        placeholder="e.g., Groceries"
                        className="table-input"
                      />
                    </td>
                    <td>
                      <select 
                        value={item.category}
                        onChange={(e) => updateExpense(index, 'category', e.target.value)}
                        className="table-input"
                      >
                        <option value="">Select...</option>
                        <option value="Housing">Housing</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Food">Food</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Other">Other</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={item.amount}
                        onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                        placeholder="0.00"
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="date" 
                        value={item.date}
                        onChange={(e) => updateExpense(index, 'date', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <button className="delete-button" onClick={() => deleteExpense(index)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="total-text">Total Expenses: ${totalExpenses.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Debts Tab */}
      {activeTab === 'debts' && (
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">Debt Tracker</h3>
            <button onClick={addDebt} className="add-button">+ Add Debt</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Debt Name</th>
                  <th>Balance</th>
                  <th>Interest Rate (%)</th>
                  <th>Monthly Payment</th>
                  <th>Months to Payoff</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.debts.map((item, index) => {
                  const monthsToPayoff = item.monthlyPayment > 0 
                    ? Math.ceil(item.balance / item.monthlyPayment)
                    : 0;
                  return (
                    <tr key={index}>
                      <td>
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={(e) => updateDebt(index, 'name', e.target.value)}
                          placeholder="e.g., Credit Card"
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={item.balance}
                          onChange={(e) => updateDebt(index, 'balance', e.target.value)}
                          placeholder="0.00"
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={item.interestRate}
                          onChange={(e) => updateDebt(index, 'interestRate', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={item.monthlyPayment}
                          onChange={(e) => updateDebt(index, 'monthlyPayment', e.target.value)}
                          placeholder="0.00"
                          className="table-input"
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="font-bold">{monthsToPayoff} months</span>
                      </td>
                      <td>
                        <button className="delete-button" onClick={() => deleteDebt(index)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="debt-summary">
            <div className="summary-item">
              <span className="font-bold">Total Debt Balance:</span>
              <span className="summary-value">${totalDebts.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="font-bold">Total Monthly Payments:</span>
              <span className="summary-value">${monthlyDebtPayments.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">Upcoming Bills & Subscriptions</h3>
            <button onClick={addBill} className="add-button">+ Add Bill</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill Name</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Recurring</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.bills.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={(e) => updateBill(index, 'name', e.target.value)}
                        placeholder="e.g., Netflix, Electricity"
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={item.amount}
                        onChange={(e) => updateBill(index, 'amount', e.target.value)}
                        placeholder="0.00"
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="date" 
                        value={item.dueDate}
                        onChange={(e) => updateBill(index, 'dueDate', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <select 
                        value={item.recurring}
                        onChange={(e) => updateBill(index, 'recurring', e.target.value === 'true')}
                        className="table-input"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </td>
                    <td>
                      <button className="delete-button" onClick={() => deleteBill(index)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="total-text">Total Bills: ${totalBills.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="card">
          <h3 className="section-title">Budget Planning</h3>
          <p className="budget-subtitle">
            Plan your budget by category and track actual spending against planned amounts.
          </p>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Planned Budget</th>
                  <th>Actual Spent</th>
                  <th>Difference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentData.budgetCategories.map((cat, index) => {
                  const difference = cat.planned - cat.actual;
                  const percentUsed = cat.planned > 0 ? (cat.actual / cat.planned) * 100 : 0;
                  return (
                    <tr key={index}>
                      <td className="font-bold">{cat.category}</td>
                      <td>
                        <input 
                          type="number" 
                          value={cat.planned}
                          onChange={(e) => updateBudgetCategory(index, 'planned', e.target.value)}
                          placeholder="0.00"
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={cat.actual}
                          onChange={(e) => updateBudgetCategory(index, 'actual', e.target.value)}
                          placeholder="0.00"
                          className="table-input"
                        />
                      </td>
                      <td style={{ color: difference >= 0 ? '#00FF00' : '#FF0000' }}>
                        ${Math.abs(difference).toFixed(2)} {difference >= 0 ? 'under' : 'over'}
                      </td>
                      <td>
                        <span style={{ 
                          color: percentUsed <= 80 ? '#00FF00' : percentUsed <= 100 ? '#FFA500' : '#FF0000',
                          fontWeight: 'bold'
                        }}>
                          {percentUsed.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="budget-summary">
            <div className="budget-summary-item">
              <div className="font-bold mb-2">Total Planned:</div>
              <div className="budget-summary-value">${currentData.budgetCategories.reduce((sum, cat) => sum + cat.planned, 0).toFixed(2)}</div>
            </div>
            <div className="budget-summary-item">
              <div className="font-bold mb-2">Total Actual:</div>
              <div className="budget-summary-value">${currentData.budgetCategories.reduce((sum, cat) => sum + cat.actual, 0).toFixed(2)}</div>
            </div>
            <div className="budget-summary-item">
              <div className="font-bold mb-2">Budget Balance:</div>
              <div className="budget-summary-value" style={{ 
                color: (currentData.budgetCategories.reduce((sum, cat) => sum + cat.planned, 0) - 
                       currentData.budgetCategories.reduce((sum, cat) => sum + cat.actual, 0)) >= 0 
                       ? '#00FF00' : '#FF0000' 
              }}>
                ${(currentData.budgetCategories.reduce((sum, cat) => sum + cat.planned, 0) - 
                   currentData.budgetCategories.reduce((sum, cat) => sum + cat.actual, 0)).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <div className="card mb-6">
            <h3 className="section-title">Financial Ratios & Metrics</h3>
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="font-bold mb-2">Savings Rate:</div>
                <div className="analytics-value">
                  {totalIncome > 0 ? ((netCashFlow / totalIncome) * 100).toFixed(1) : 0}%
                </div>
                <div className="analytics-subtitle">
                  {((netCashFlow / totalIncome) * 100) >= 20 ? 'Excellent!' : 'Aim for 20%+'}
                </div>
              </div>
              <div className="analytics-card">
                <div className="font-bold mb-2">Expense Ratio:</div>
                <div className="analytics-value">
                  {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : 0}%
                </div>
                <div className="analytics-subtitle">
                  {((totalExpenses / totalIncome) * 100) <= 50 ? 'Good control' : 'Consider reducing'}
                </div>
              </div>
              <div className="analytics-card">
                <div className="font-bold mb-2">Debt Service Ratio:</div>
                <div className="analytics-value">
                  {totalIncome > 0 ? ((monthlyDebtPayments / totalIncome) * 100).toFixed(1) : 0}%
                </div>
                <div className="analytics-subtitle">
                  {((monthlyDebtPayments / totalIncome) * 100) <= 36 ? 'Healthy' : 'High debt load'}
                </div>
              </div>
              <div className="analytics-card">
                <div className="font-bold mb-2">Emergency Fund Goal:</div>
                <div className="analytics-value">
                  ${(totalExpenses * 6).toFixed(2)}
                </div>
                <div className="analytics-subtitle">
                  6 months of expenses
                </div>
              </div>
              <div className="analytics-card">
                <div className="font-bold mb-2">Financial Freedom Number:</div>
                <div className="analytics-value">
                  ${((totalExpenses * 12) * 25).toFixed(2)}
                </div>
                <div className="analytics-subtitle">
                  25x annual expenses (4% rule)
                </div>
              </div>
              <div className="analytics-card">
                <div className="font-bold mb-2">Monthly Surplus/Deficit:</div>
                <div className="analytics-value" style={{ color: netCashFlow >= 0 ? '#00FF00' : '#FF0000' }}>
                  ${netCashFlow.toFixed(2)}
                </div>
                <div className="analytics-subtitle">
                  After all obligations
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">Income Distribution</h3>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="chart-placeholder">
                Add income and expenses to see your distribution chart
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="footer">
        <p>© 2025 Money Lodge by Empire Domination. All data stored locally in your browser.</p>
        <p className="footer-date">Current date: Friday, October 24, 2025</p>
      </div>
    </div>
  );
}

export default App;