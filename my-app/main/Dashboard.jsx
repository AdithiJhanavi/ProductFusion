import React, { useState, useEffect } from 'react';
import './Dashboard.css';

// Mock API for sales data
const fetchSalesData = async (startDate, endDate, category) => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const start = startDate ? new Date(startDate) : new Date('2023-01-01');
  const end = endDate ? new Date(endDate) : new Date();
  const days = Math.ceil((end - start) / (86400 * 1000)) + 1;

  const categories = ['Electronics', 'Clothing', 'Food', 'Books'];
  const selectedCategories = category ? [category] : categories;

  return Array.from({ length: days }).map((_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const dayData = { date: dateStr };
    selectedCategories.forEach(cat => {
      dayData[cat] = Math.round((Math.random() * 500 + 200) * (date.getDay() % 3 + 1));
    });

    return dayData;
  });
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const cacheKey = `sales-${filters.startDate}-${filters.endDate}-${filters.category}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 3600000) {
            setData(data);
            setFilteredData(data);
            return;
          }
        }

        const freshData = await fetchSalesData(
          filters.startDate,
          filters.endDate,
          filters.category
        );

        setData(freshData);
        setFilteredData(freshData);

        localStorage.setItem(cacheKey, JSON.stringify({
          data: freshData,
          timestamp: Date.now()
        }));

      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  // ✅ Fixed getStats function
  const getStats = () => {
    const stats = { total: 0, categories: {} };
    const cats = ['Electronics', 'Clothing', 'Food', 'Books'];

    cats.forEach(cat => {
      const values = filteredData.map(d => d[cat] || 0);
      const total = values.reduce((a, b) => a + b, 0);
      const avg = Math.round(total / values.length);
      const max = Math.max(...values);
      const min = Math.min(...values);

      stats.categories[cat] = { total, avg, max, min };
      stats.total += total;
    });

    return stats;
  };

  const stats = getStats();

  return (
    <div className="dashboard-container">
      <h1>Sales Dashboard</h1>

      {error && <div className="error">{error}</div>}

      {/* Filters */}
      <div className="filters-container">
        <div>
          <label>Start Date:
            <input 
              type="date" 
              value={filters.startDate}
              onChange={e => setFilters({ ...filters, startDate: e.target.value })}
            />
          </label>
        </div>

        <div>
          <label>End Date:
            <input 
              type="date" 
              value={filters.endDate}
              onChange={e => setFilters({ ...filters, endDate: e.target.value })}
            />
          </label>
        </div>

        <div>
          <label>Category:
            <select
              value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Food">Food</option>
              <option value="Books">Books</option>
            </select>
          </label>
        </div>

        <button onClick={() => window.location.reload()}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading data...</div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="summary-container">
            <div className="summary-card">
              <h3>Total Sales</h3>
              <p>${stats.total.toLocaleString()}</p>
            </div>

            {Object.entries(stats.categories).map(([cat, values]) => (
              <div key={cat} className="summary-card">
                <h3>{cat}</h3>
                <p>Total: ${values.total.toLocaleString()}</p>
                <p>Avg: ${values.avg.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Chart Placeholder */}
          <div className="chart-container">
            <h2>Sales Trend</h2>
            <div className="chart-placeholder">
              {filteredData.length > 0 ? (
                <p>Line chart would show {filteredData.length} days of data</p>
              ) : (
                <p>No data to display</p>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="table-container">
            <h2>Sales Data</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Electronics</th>
                  <th>Clothing</th>
                  <th>Food</th>
                  <th>Books</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 10).map(day => (
                  <tr key={day.date}>
                    <td>{day.date}</td>
                    <td>${day.Electronics?.toLocaleString() || '-'}</td>
                    <td>${day.Clothing?.toLocaleString() || '-'}</td>
                    <td>${day.Food?.toLocaleString() || '-'}</td>
                    <td>${day.Books?.toLocaleString() || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
