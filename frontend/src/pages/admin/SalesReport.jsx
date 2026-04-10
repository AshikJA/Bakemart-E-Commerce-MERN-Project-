import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

export default function SalesReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProductsSold: 0,
    salesByDate: [],
    salesByProduct: [],
    salesByCategory: []
  });

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/admin/reports/sales', {
        params
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching sales report', error);
      toast.error(error.response?.data?.message || 'Failed to fetch report');
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = 'Sales Report';
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    doc.setFontSize(11);
    const dateText = `Date Range: ${startDate || 'All Time'} to ${endDate || 'Present'}`;
    doc.text(dateText, 14, 30);
    doc.text(`Total Revenue: Rs ${data.totalRevenue?.toLocaleString() || 0}`, 14, 38);
    doc.text(`Total Orders: ${data.totalOrders || 0}`, 14, 44);
    doc.text(`Products Sold: ${data.totalProductsSold || 0}`, 14, 50);
    doc.text(`Average Order Value: Rs ${avgOrderValue || 0}`, 14, 56);
    
    // Table 1: Sales by Product
    autoTable(doc, {
      startY: 65,
      head: [['#', 'Product', 'Qty Sold', 'Revenue (Rs)']],
      body: (data.salesByProduct || []).map((item, index) => [
        index + 1,
        item.name || 'Unknown',
        item.qty || 0,
        item.revenue?.toLocaleString() || 0
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, // blue-500
      margin: { top: 10 }
    });

    // Table 2: Sales by Category
    autoTable(doc, {
      startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 120,
      head: [['Category', 'Qty Sold', 'Revenue (Rs)']],
      body: (data.salesByCategory || []).map(item => [
        item.category || 'Uncategorized',
        item.qty || 0,
        item.revenue?.toLocaleString() || 0
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save('sales_report.pdf');
  };

  const handlePrint = () => {
    window.print();
  };

  const avgOrderValue = data.totalOrders > 0 ? (data.totalRevenue / data.totalOrders).toFixed(2) : 0;

  if (loading && !data.totalRevenue) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-8">
      {/* Hide on print */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            body { background: white; }
            .print-shadow-none { box-shadow: none !important; border: 1px solid #e2e8f0; }
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors no-print w-max"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sales Report</h1>
            <p className="text-slate-500">Analytics and revenue overview</p>
          </div>
          <div className="flex items-center gap-3 no-print">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 font-medium transition shadow-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print
            </button>
            <button 
              onClick={handleExportPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export PDF
            </button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 no-print">
          <form className="flex flex-wrap items-end gap-4" onSubmit={handleApplyFilter}>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-600 mb-1">Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-600 mb-1">End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Applying...' : 'Apply Filter'}
            </button>
          </form>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print-shadow-none">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900">Rs {data.totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print-shadow-none">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Orders</p>
            <h3 className="text-2xl font-bold text-slate-900">{data.totalOrders}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print-shadow-none">
            <p className="text-sm font-medium text-slate-500 mb-1">Products Sold</p>
            <h3 className="text-2xl font-bold text-slate-900">{data.totalProductsSold}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print-shadow-none">
            <p className="text-sm font-medium text-slate-500 mb-1">Average Order Value</p>
            <h3 className="text-2xl font-bold text-slate-900">Rs {avgOrderValue}</h3>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 break-inside-avoid">
          {/* Revenue Over Time */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print-shadow-none">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Revenue Over Time</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.salesByDate}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} width={80} axisLine={false} tickLine={false} tickFormatter={(value) => `Rs${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`Rs ${value}`, 'Revenue']}
                    labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales by Category (Pie) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print-shadow-none">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Sales by Category</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`Rs ${value}`, 'Revenue']}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
                  <Pie
                    data={data.salesByCategory}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    label={({name, percent}) => `${name.length > 15 ? name.substring(0, 15) + '...' : name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print-shadow-none break-inside-avoid">
           <h3 className="text-lg font-semibold text-slate-800 mb-6">Top Products by Revenue</h3>
           <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salesByProduct.slice(0, 10)} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{fontSize: 12, fill: '#475569'}} 
                    width={180} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(name) => name.length > 25 ? name.substring(0, 25) + '...' : name}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`Rs ${value}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print-shadow-none break-inside-avoid">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-800">Sales by Product</h3>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">Product</th>
                    <th scope="col" className="px-6 py-3 font-medium text-right">Qty</th>
                    <th scope="col" className="px-6 py-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.salesByProduct.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-medium text-slate-700">{item.name}</td>
                      <td className="px-6 py-3 text-slate-600 text-right">{item.qty}</td>
                      <td className="px-6 py-3 text-slate-900 font-medium text-right">Rs {item.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                  {data.salesByProduct.length === 0 && (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400">No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print-shadow-none break-inside-avoid">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-800">Sales by Category</h3>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">Category</th>
                    <th scope="col" className="px-6 py-3 font-medium text-right">Qty</th>
                    <th scope="col" className="px-6 py-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.salesByCategory.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-medium text-slate-700">{item.category}</td>
                      <td className="px-6 py-3 text-slate-600 text-right">{item.qty}</td>
                      <td className="px-6 py-3 text-slate-900 font-medium text-right">Rs {item.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                  {data.salesByCategory.length === 0 && (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400">No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
