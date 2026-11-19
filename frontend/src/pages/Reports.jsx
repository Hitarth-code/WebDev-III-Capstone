import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardReport();
  }, []);

  const fetchDashboardReport = async () => {
    try {
      setLoading(true);
      setError('');
      const reportData = await reportAPI.getDashboard();
      setData(reportData);
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading reports...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  const { summary, revenueByHotel, occupancyReport } = data || {};

  return (
    <div>
      <div className="section-title">
        <div>
          <h2>Occupancy & Revenue Reports</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', fontWeight: 'normal', marginTop: '4px' }}>
            MongoDB Aggregation Analytics
          </p>
        </div>
        <button onClick={fetchDashboardReport} className="btn btn-outline btn-sm">
          Refresh
        </button>
      </div>

      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-label">Total Revenue</div>
          <div className="metric-value highlight">₹{summary?.totalRevenue || 0}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Confirmed Bookings</div>
          <div className="metric-value green">{summary?.confirmedBookings || 0}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Cancelled Bookings</div>
          <div className="metric-value" style={{ color: '#ef4444' }}>
            {summary?.cancelledBookings || 0}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Room Nights</div>
          <div className="metric-value">{summary?.totalNightsBooked || 0}</div>
        </div>
      </div>

      <div className="report-table-card">
        <h3 style={{ marginBottom: '14px', color: '#111827' }}>
          Hotel Occupancy Rate
        </h3>
        {occupancyReport && occupancyReport.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No records found.</p>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>Hotel</th>
                <th>City</th>
                <th>Total Rooms</th>
                <th>Rooms Booked</th>
                <th>Occupancy Rate</th>
              </tr>
            </thead>
            <tbody>
              {occupancyReport &&
                occupancyReport.map((item) => (
                  <tr key={item.hotelId}>
                    <td><strong>{item.hotelName}</strong></td>
                    <td>{item.city}</td>
                    <td>{item.totalRooms}</td>
                    <td>{item.roomsBooked}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '100px', backgroundColor: '#e5e7eb', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(item.occupancyRate, 100)}%`,
                              backgroundColor: item.occupancyRate > 70 ? '#10b981' : item.occupancyRate > 30 ? '#3b82f6' : '#f59e0b',
                              height: '100%'
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: '600' }}>{item.occupancyRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="report-table-card">
        <h3 style={{ marginBottom: '14px', color: '#111827' }}>
          Revenue by Hotel
        </h3>
        {revenueByHotel && revenueByHotel.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No records found.</p>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>Hotel</th>
                <th>City</th>
                <th>Bookings</th>
                <th>Nights</th>
                <th>Avg Booking</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {revenueByHotel &&
                revenueByHotel.map((item) => (
                  <tr key={item.hotelId}>
                    <td><strong>{item.hotelName}</strong></td>
                    <td>{item.city}</td>
                    <td>{item.bookingsCount}</td>
                    <td>{item.nightsCount}</td>
                    <td>₹{item.avgBookingValue}</td>
                    <td style={{ fontWeight: '700', color: '#2563eb' }}>₹{item.totalRevenue}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;
