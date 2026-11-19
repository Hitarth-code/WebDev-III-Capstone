// Manage Rooms Page (Hotel Manager & Admin)
import React, { useState, useEffect } from 'react';
import { hotelAPI, roomAPI } from '../services/api';

const ManageRooms = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal & Form States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    hotel: '',
    roomNumber: '',
    roomType: 'Standard',
    pricePerNight: 2000,
    capacity: 2,
    amenities: 'Free Wi-Fi, Air Conditioning, TV',
    description: '',
    image: ''
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (selectedHotelId) {
      fetchRooms(selectedHotelId);
    } else {
      setRooms([]);
    }
  }, [selectedHotelId]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await hotelAPI.getMyHotels();
      setHotels(data);
      if (data.length > 0) {
        setSelectedHotelId(data[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (hotelId) => {
    try {
      setLoading(true);
      setError('');
      const data = await roomAPI.getByHotel(hotelId);
      setRooms(data);
    } catch (err) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    if (!selectedHotelId) {
      alert('Please select or create a hotel first.');
      return;
    }
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      hotel: selectedHotelId,
      roomNumber: '',
      roomType: 'Standard',
      pricePerNight: 2000,
      capacity: 2,
      amenities: 'Free Wi-Fi, Air Conditioning, TV',
      description: 'Comfortable and clean room with modern amenities.',
      image: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (room) => {
    setIsEditing(true);
    setCurrentId(room._id);
    setFormData({
      hotel: room.hotel,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : '',
      description: room.description || '',
      image: room.image || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      // Split amenities string into an array
      const amenitiesArray = formData.amenities
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a !== '');

      const payload = {
        ...formData,
        pricePerNight: Number(formData.pricePerNight),
        capacity: Number(formData.capacity),
        amenities: amenitiesArray
      };

      if (isEditing) {
        await roomAPI.update(currentId, payload);
        setSuccess('Room updated successfully!');
      } else {
        await roomAPI.create(payload);
        setSuccess('Room created successfully!');
      }

      setShowModal(false);
      fetchRooms(selectedHotelId);
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await roomAPI.delete(roomId);
      setSuccess('Room deleted successfully!');
      fetchRooms(selectedHotelId);
    } catch (err) {
      setError(err.message || 'Failed to delete room');
    }
  };

  return (
    <div>
      <div className="section-title">
        <h2>Manage Rooms & Room Types (CRUD)</h2>
        <button onClick={handleOpenCreate} className="btn btn-primary" disabled={hotels.length === 0}>
          ➕ Add New Room
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Select Hotel Dropdown */}
      <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563', marginRight: '12px' }}>
          Select Hotel:
        </label>
        <select
          value={selectedHotelId}
          onChange={(e) => setSelectedHotelId(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '240px' }}
        >
          {hotels.map((h) => (
            <option key={h._id} value={h._id}>
              {h.name} ({h.city})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '10px' }}>
          <h3>No rooms added for this hotel yet.</h3>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            Click "Add New Room" above to add room numbers and types.
          </p>
        </div>
      ) : (
        <div className="report-table-card">
          <table className="report-table">
            <thead>
              <tr>
                <th>Room #</th>
                <th>Type</th>
                <th>Price/Night</th>
                <th>Capacity</th>
                <th>Amenities</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id}>
                  <td><strong>#{room.roomNumber}</strong></td>
                  <td>
                    <span className="amenity-chip" style={{ background: '#e0e7ff', color: '#3730a3', fontWeight: '600' }}>
                      {room.roomType}
                    </span>
                  </td>
                  <td>₹{room.pricePerNight}</td>
                  <td>{room.capacity} Persons</td>
                  <td style={{ maxWidth: '250px' }}>
                    {room.amenities && room.amenities.join(', ')}
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpenEdit(room)}
                      className="btn btn-secondary btn-sm"
                      style={{ marginRight: '8px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(room._id)}
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

      {/* Add / Edit Room Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Room' : 'Add New Room'}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Room Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101, 202, 305"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Room Type</label>
                <select
                  value={formData.roomType}
                  onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Family Suite">Family Suite</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price Per Night (₹)</label>
                <input
                  type="number"
                  required
                  min="500"
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Max Guest Capacity</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Amenities (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Free Wi-Fi, Air Conditioning, TV, Mini Bar"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/room.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="2"
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
                  {isEditing ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
