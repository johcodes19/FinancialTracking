
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

function App() {
  const [selectedMonth, setSelectedMonth] = useState(9); // October (0-indexed)
  const [selectedYear, setSelectedYear] = useState(2025);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Initialize with stored data or defaults
 const [monthlyData, setMonthlyData] = useState(() => {
    const stored = localStorage.getItem('moneyLodgeData');
    if (!stored) return {};
   try {
     const parsed = JSON.parse(stored);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      console.warn('Invalid moneyLodgeData in localStorage — resetting.', e);
      localStorage.removeItem('moneyLodgeData');
      return {};
    }
  });

// ...existing code...
  const currentKey = `${selectedYear}-${selectedMonth}`;

  // Ensure currentData always has expected shape (prevents undefined.reduce errors)
  const defaultData = {
    income: [],
    expenses: [],
    debts: [],
    bills: [],
    savings: [],
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


const currentData = { ...defaultData, ...(monthlyData[currentKey] || {}) };

// add/update this helper so all updates persist correctly
const updateCurrentData = (patch) => {
  setMonthlyData(prev => {
    const next = { ...prev };
    next[currentKey] = { ...(prev[currentKey] || defaultData), ...patch };
    return next;
  });
};

// persist monthlyData to localStorage
useEffect(() => {
  try {
    localStorage.setItem('moneyLodgeData', JSON.stringify(monthlyData));
  } catch (e) {
    console.error('Failed saving monthlyData to localStorage', e);
  }
}, [monthlyData]);


  // Financial calculations — use safe array access (currentData is merged with defaults above,
  // but these guards make it robust if something else mutates state)
  const totalIncome = (currentData.income || []).reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalExpenses = (currentData.expenses || []).reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalDebts = (currentData.debts || []).reduce((sum, item) => sum + parseFloat(item.balance || 0), 0);
  const totalBills = (currentData.bills || []).reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalSavings = (currentData.savings || []).reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const monthlyDebtPayments = (currentData.debts || []).reduce((sum, item) => sum + parseFloat(item.monthlyPayment || 0), 0);

  
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

  const addSavings = () => {
    updateCurrentData({
      savings: [...currentData.savings, { account: '', amount: 0, goal: 0, date: new Date().toISOString().split('T')[0] }]
    });
  };

  const updateSavings = (index, field, value) => {
    const newSavings = [...currentData.savings];
    newSavings[index][field] = value;
    updateCurrentData({ savings: newSavings });
  };

  const deleteSavings = (index) => {
    updateCurrentData({
      savings: currentData.savings.filter((_, i) => i !== index)
    });
  };

  const addBudgetCategory = () => {
    updateCurrentData({
      budgetCategories: [...currentData.budgetCategories, { category: '', planned: 0, actual: 0 }]
    });
  };

  const updateBudgetCategory = (index, field, value) => {
    const newCategories = [...currentData.budgetCategories];
    newCategories[index][field] = field === 'category' ? value : parseFloat(value) || 0;
    updateCurrentData({ budgetCategories: newCategories });
  };

  const deleteBudgetCategory = (index) => {
    updateCurrentData({
      budgetCategories: currentData.budgetCategories.filter((_, i) => i !== index)
    });
  };

  const pieChartData = [
    { name: 'Expenses', value: totalExpenses, color: '#FF0000' },
    { name: 'Bills', value: totalBills, color: '#DAA520' },
    { name: 'Debt Payments', value: monthlyDebtPayments, color: '#B8860B' },
    { name: 'Remaining', value: Math.max(0, netCashFlow), color: '#00FF00' }
  ].filter(item => item.value > 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#FFD700', padding: '1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#FFD700', marginBottom: '0.5rem' }}>
          💰 MONEY LODGE
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#DAA520' }}>by Empire Domination</p>
      </div>

      {/* Month/Year Selector */}
      <div style={{ backgroundColor: '#1a1506', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Month:</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Year:</label>
            <input 
              type="number" 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
            />
          </div>
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }}>
            {months[selectedMonth]} {selectedYear}
          </h2>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
        {['overview', 'income', 'expenses', 'debts', 'bills', 'savings', 'budget', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? '#FFD700' : '#1a1506',
              color: activeTab === tab ? '#000' : '#FFD700',
              padding: '0.5rem 1rem',
              border: '2px solid #FFD700',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a1506 0%, #2d2410 100%)', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFD700' }}>${totalIncome.toFixed(2)}</div>
              <div style={{ fontSize: '0.875rem', color: '#DAA520', marginTop: '0.5rem' }}>Total Income</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1a1506 0%, #2d2410 100%)', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF0000' }}>${totalExpenses.toFixed(2)}</div>
              <div style={{ fontSize: '0.875rem', color: '#DAA520', marginTop: '0.5rem' }}>Total Expenses</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1a1506 0%, #2d2410 100%)', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00FF00' }}>${netCashFlow.toFixed(2)}</div>
              <div style={{ fontSize: '0.875rem', color: '#DAA520', marginTop: '0.5rem' }}>Net Cash Flow</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1a1506 0%, #2d2410 100%)', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4169E1' }}>${totalSavings.toFixed(2)}</div>
              <div style={{ fontSize: '0.875rem', color: '#DAA520', marginTop: '0.5rem' }}>Total Savings</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1a1506 0%, #2d2410 100%)', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFD700' }}>${totalDebts.toFixed(2)}</div>
              <div style={{ fontSize: '0.875rem', color: '#DAA520', marginTop: '0.5rem' }}>Total Debt Balance</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#1a1506', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700', marginBottom: '1rem' }}>Financial Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
                  <span>Total Income:</span>
                  <span style={{ fontWeight: 'bold' }}>${totalIncome.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
                  <span>- Total Expenses:</span>
                  <span style={{ fontWeight: 'bold', color: '#FF0000' }}>-${totalExpenses.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
                  <span>- Upcoming Bills:</span>
                  <span style={{ fontWeight: 'bold' }}>-${totalBills.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
                  <span>- Debt Payments:</span>
                  <span style={{ fontWeight: 'bold' }}>-${monthlyDebtPayments.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#2d2410', borderRadius: '0.25rem', fontSize: '1.25rem' }}>
                  <span style={{ fontWeight: 'bold' }}>Remaining:</span>
                  <span style={{ fontWeight: 'bold', color: remainingAfterDebts >= 0 ? '#00FF00' : '#FF0000' }}>
                    ${remainingAfterDebts.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#1a1506', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700', marginBottom: '1rem' }}>Savings Calculator</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Savings Goal (% of Income):</label>
                <input 
                  type="number" 
                  value={currentData.savingsGoal}
                  onChange={(e) => updateCurrentData({ savingsGoal: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
                  <span>Recommended Savings ({currentData.savingsGoal}%):</span>
                  <span style={{ fontWeight: 'bold' }}>${savingsAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
                  <span>Available After Savings:</span>
                  <span style={{ fontWeight: 'bold' }}>${remainingAfterSavings.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
                  <span>Debt-to-Income Ratio:</span>
                  <span style={{ fontWeight: 'bold' }}>
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
        <div style={{ backgroundColor: '#1a1506', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }}>Income Sources</h3>
            <button onClick={addIncome} style={{ backgroundColor: '#FFD700', color: '#000', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>
              + Add Income
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', backgroundColor: '#1a1506', fontWeight: 'bold' }}>Source</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', backgroundColor: '#1a1506', fontWeight: 'bold' }}>Amount</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', backgroundColor: '#1a1506', fontWeight: 'bold' }}>Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', backgroundColor: '#1a1506', fontWeight: 'bold' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.income.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <input 
                        type="text" 
                        value={item.source}
                        onChange={(e) => updateIncome(index, 'source', e.target.value)}
                        placeholder="e.g., Salary, Freelance"
                        style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <input 
                        type="number" 
                        value={item.amount}
                        onChange={(e) => updateIncome(index, 'amount', e.target.value)}
                        placeholder="0.00"
                        style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <input 
                        type="date" 
                        value={item.date}
                        onChange={(e) => updateIncome(index, 'date', e.target.value)}
                        style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <button style={{ backgroundColor: '#8B0000', color: '#FFD700', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => deleteIncome(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Total Income: ${totalIncome.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div style={{ backgroundColor: '#1a1506', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }}>Expenses</h3>
            <button onClick={addExpense} style={{ backgroundColor: '#FFD700', color: '#000', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>
              + Add Expense
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', backgroundColor: '#1a1506', fontWeight: 'bold' }}>Description</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', backgroundColor: '#1a1506', fontWeight: 'bold' }}>Category</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', backgroundColor: '#1a1506', fontWeight: 'bold' }}>Amount</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', backgroundColor: '#1a1506', fontWeight: 'bold' }}>Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', backgroundColor: '#1a1506', fontWeight: 'bold' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.expenses.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => updateExpense(index, 'description', e.target.value)}
                        placeholder="e.g., Groceries"
                        style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <input 
                        type="text" 
                        value={item.category}
                        onChange={(e) => updateExpense(index, 'category', e.target.value)}
                        placeholder="e.g., Food, Transport"
                        style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <input 
                        type="number" 
                        value={item.amount}
                        onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                        placeholder="0.00"
                        style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <input 
                        type="date" 
                        value={item.date}
                        onChange={(e) => updateExpense(index, 'date', e.target.value)}
                        style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <button style={{ backgroundColor: '#8B0000', color: '#FFD700', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => deleteExpense(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#FF0000' }}>Total Expenses: ${totalExpenses.toFixed(2)}</span>
          </div>
        </div>
      )}
{/* Debts Tab */}
      {activeTab === 'debts' && (
        <div style={{ backgroundColor: '#1a1506', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }}>Debt Tracker</h3>
            <button onClick={addDebt} style={{ backgroundColor: '#FFD700', color: '#000', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>
              + Add Debt
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Debt Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Balance</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Interest Rate (%)</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Monthly Payment</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Months to Payoff</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.debts.map((item, index) => {
                  const monthsToPayoff = item.monthlyPayment > 0 
                    ? Math.ceil(item.balance / item.monthlyPayment)
                    : 0;
                  return (
                    <tr key={index}>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={(e) => updateDebt(index, 'name', e.target.value)}
                          placeholder="e.g., Credit Card"
                          style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <input 
                          type="number" 
                          value={item.balance}
                          onChange={(e) => updateDebt(index, 'balance', e.target.value)}
                          placeholder="0.00"
                          style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <input 
                          type="number" 
                          value={item.interestRate}
                          onChange={(e) => updateDebt(index, 'interestRate', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <input 
                          type="number" 
                          value={item.monthlyPayment}
                          onChange={(e) => updateDebt(index, 'monthlyPayment', e.target.value)}
                          placeholder="0.00"
                          style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410', textAlign: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>{monthsToPayoff} months</span>
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <button style={{ backgroundColor: '#8B0000', color: '#FFD700', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => deleteDebt(index)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
              <span style={{ fontWeight: 'bold' }}>Total Debt Balance:</span>
              <span style={{ fontSize: '1.25rem', marginLeft: '0.5rem' }}>${totalDebts.toFixed(2)}</span>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
              <span style={{ fontWeight: 'bold' }}>Total Monthly Payments:</span>
              <span style={{ fontSize: '1.25rem', marginLeft: '0.5rem' }}>${monthlyDebtPayments.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <div style={{ backgroundColor: '#1a1506', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }}>Upcoming Bills & Subscriptions</h3>
            <button onClick={addBill} style={{ backgroundColor: '#FFD700', color: '#000', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>
              + Add Bill
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Bill Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Amount</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Due Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Recurring</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.bills.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={(e) => updateBill(index, 'name', e.target.value)}
                        placeholder="e.g., Netflix, Electricity"
                        style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <input 
                        type="number" 
                        value={item.amount}
                        onChange={(e) => updateBill(index, 'amount', e.target.value)}
                        placeholder="0.00"
                        style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <input 
                        type="date" 
                        value={item.dueDate}
                        onChange={(e) => updateBill(index, 'dueDate', e.target.value)}
                        style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <select 
                        value={item.recurring ? 'true' : 'false'}
                        onChange={(e) => updateBill(index, 'recurring', e.target.value === 'true')}
                        style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                      <button style={{ backgroundColor: '#8B0000', color: '#FFD700', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => deleteBill(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Total Bills: ${totalBills.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Savings Tab */}
      {activeTab === 'savings' && (
        <div style={{ backgroundColor: '#1a1506', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }}>Savings Accounts</h3>
            <button onClick={addSavings} style={{ backgroundColor: '#FFD700', color: '#000', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>
              + Add Savings
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Account Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Current Amount</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Goal Amount</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Progress</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.savings.map((item, index) => {
                  const progress = item.goal > 0 ? ((item.amount / item.goal) * 100).toFixed(1) : 0;
                  return (
                    <tr key={index}>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <input 
                          type="text" 
                          value={item.account}
                          onChange={(e) => updateSavings(index, 'account', e.target.value)}
                          placeholder="e.g., Emergency Fund"
                          style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <input 
                          type="number" 
                          value={item.amount}
                          onChange={(e) => updateSavings(index, 'amount', e.target.value)}
                          placeholder="0.00"
                          style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <input 
                          type="number" 
                          value={item.goal}
                          onChange={(e) => updateSavings(index, 'goal', e.target.value)}
                          placeholder="0.00"
                          style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410', textAlign: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: progress >= 100 ? '#00FF00' : progress >= 50 ? '#FFA500' : '#FFD700' }}>
                          {progress}%
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <input 
                          type="date" 
                          value={item.date}
                          onChange={(e) => updateSavings(index, 'date', e.target.value)}
                          style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <button style={{ backgroundColor: '#8B0000', color: '#FFD700', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => deleteSavings(index)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4169E1' }}>Total Savings: ${totalSavings.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div style={{ backgroundColor: '#1a1506', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700', marginBottom: '1rem' }}>Budget Planning</h3>
          <p style={{ color: '#DAA520', marginBottom: '1rem' }}>
            Plan your budget by category and track actual spending against planned amounts.
          </p>
          <button onClick={addBudgetCategory} style={{ backgroundColor: '#FFD700', color: '#000', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
            + Add Custom Category
          </button>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Category</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Planned Budget</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Actual Spent</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Difference</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #2d2410', fontWeight: 'bold' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.budgetCategories.map((cat, index) => {
                  const difference = cat.planned - cat.actual;
                  const percentUsed = cat.planned > 0 ? (cat.actual / cat.planned) * 100 : 0;
                  return (
                    <tr key={index}>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <input 
                          type="text" 
                          value={cat.category}
                          onChange={(e) => updateBudgetCategory(index, 'category', e.target.value)}
                          placeholder="Category name"
                          style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%', fontWeight: 'bold' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <input 
                          type="number" 
                          value={cat.planned}
                          onChange={(e) => updateBudgetCategory(index, 'planned', e.target.value)}
                          placeholder="0.00"
                          style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <input 
                          type="number" 
                          value={cat.actual}
                          onChange={(e) => updateBudgetCategory(index, 'actual', e.target.value)}
                          placeholder="0.00"
                          style={{ backgroundColor: '#1a1506', color: '#FFD700', border: '1px solid #FFD700', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410', color: difference >= 0 ? '#00FF00' : '#FF0000' }}>
                        ${Math.abs(difference).toFixed(2)} {difference >= 0 ? 'under' : 'over'}
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <span style={{ 
                          color: percentUsed <= 80 ? '#00FF00' : percentUsed <= 100 ? '#FFA500' : '#FF0000',
                          fontWeight: 'bold'
                        }}>
                          {percentUsed.toFixed(0)}%
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', borderBottom: '1px solid #2d2410' }}>
                        <button style={{ backgroundColor: '#8B0000', color: '#FFD700', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => deleteBudgetCategory(index)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Total Planned:</div>
              <div style={{ fontSize: '1.5rem' }}>${currentData.budgetCategories.reduce((sum, cat) => sum + cat.planned, 0).toFixed(2)}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Total Actual:</div>
              <div style={{ fontSize: '1.5rem' }}>${currentData.budgetCategories.reduce((sum, cat) => sum + cat.actual, 0).toFixed(2)}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Budget Balance:</div>
              <div style={{ 
                fontSize: '1.5rem',
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
          <div style={{ backgroundColor: '#1a1506', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700', marginBottom: '1rem' }}>Financial Ratios & Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Savings Rate:</div>
                <div style={{ fontSize: '1.5rem' }}>
                  {totalIncome > 0 ? ((netCashFlow / totalIncome) * 100).toFixed(1) : 0}%
                </div>
                <div style={{ fontSize: '0.875rem', color: '#DAA520', marginTop: '0.25rem' }}>
                  {totalIncome > 0 && ((netCashFlow / totalIncome) * 100) >= 20 ? 'Excellent!' : 'Aim for 20%+'}
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Expense Ratio:</div>
                <div style={{ fontSize: '1.5rem' }}>
                  {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : 0}%
                </div>
                <div style={{ fontSize: '0.875rem', color: '#DAA520', marginTop: '0.25rem' }}>
                  {((totalExpenses / totalIncome) * 100) <= 50 ? 'Good control' : 'Consider reducing'}
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Debt Service Ratio:</div>
                <div style={{ fontSize: '1.5rem' }}>
                  {totalIncome > 0 ? ((monthlyDebtPayments / totalIncome) * 100).toFixed(1) : 0}%
                </div>
                <div style={{ fontSize: '0.875rem', color: '#DAA520', marginTop: '0.25rem' }}>
                  {((monthlyDebtPayments / totalIncome) * 100) <= 36 ? 'Healthy' : 'High debt load'}
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Emergency Fund Goal:</div>
                <div style={{ fontSize: '1.5rem' }}>
                  ${(totalExpenses * 6).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#DAA520', marginTop: '0.25rem' }}>
                  6 months of expenses
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Financial Freedom Number:</div>
                <div style={{ fontSize: '1.5rem' }}>
                  ${((totalExpenses * 12) * 25).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#DAA520', marginTop: '0.25rem' }}>
                  25x annual expenses (4% rule)
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#1a1506', borderRadius: '0.25rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Monthly Surplus/Deficit:</div>
                <div style={{ fontSize: '1.5rem', color: netCashFlow >= 0 ? '#00FF00' : '#FF0000' }}>
                  ${netCashFlow.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#DAA520', marginTop: '0.25rem' }}>
                  After all obligations
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#1a1506', border: '2px solid #FFD700', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700', marginBottom: '1rem' }}>Income Distribution</h3>
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
              <p style={{ textAlign: 'center', padding: '2rem', color: '#DAA520' }}>
                Add income and expenses to see your distribution chart
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#DAA520' }}>
        <p>© 2025 Money Lodge by Empire Domination. All data stored securely.</p>
        <p style={{ marginTop: '0.5rem' }}>Current date: Wednesday, October 29, 2025</p>
      </div>
    </div>
  );
}

export default App;