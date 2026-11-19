import React, { useState, useEffect } from 'react';
import { hotelAPI } from '../services/api';

const ManageHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    rating: 4.5,
    phone: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    fetchMyHotels();
  }, []);

  const fetchMyHotels = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await hotelAPI.getMyHotels();
      setHotels(data);
    } catch (err) {
      setError(err.message || 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      rating: 4.5,
      phone: '',
      description: '',
      image: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (hotel) => {
    setIsEditing(true);
    setCurrentId(hotel._id);
    setFormData({
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      rating: hotel.rating,
      phone: hotel.phone || '',
      description: hotel.description,
      image: hotel.image || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (isEditing) {
        await hotelAPI.update(currentId, formData);
        setSuccess('Hotel updated successfully!');
      } else {
        await hotelAPI.create(formData);
        setSuccess('Hotel created successfully!');
      }

      setShowModal(false);
      fetchMyHotels();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hotel and its rooms?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await hotelAPI.delete(id);
      setSuccess('Hotel deleted successfully!');
      fetchMyHotels();
    } catch (err) {
      setError(err.message || 'Failed to delete hotel');
    }
  };

  return (
    <div>
      <div className="section-title">
        <h2>Manage Hotels</h2>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          Add Hotel
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading hotels...</div>
      ) : hotels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '10px' }}>
          <h3>No hotels managed yet.</h3>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            Click "Add Hotel" to add a hotel.
          </p>
        </div>
      ) : (
        <div className="report-table-card">
          <table className="report-table">
            <thead>
              <tr>
                <th>Hotel</th>
                <th>City</th>
                <th>Rating</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel) => (
                <tr key={hotel._id}>
                  <td>
                    <strong>{hotel.name}</strong>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{hotel.address}</div>
                  </td>
                  <td>{hotel.city}</td>
                  <td>★ {hotel.rating}</td>
                  <td>{hotel.phone || 'N/A'}</td>
                  <td>
                    <button
                      onClick={() => handleOpenEdit(hotel)}
                      className="btn btn-secondary btn-sm"
                      style={{ marginRight: '8px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(hotel._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Hotel' : 'Add Hotel'}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHotels;
