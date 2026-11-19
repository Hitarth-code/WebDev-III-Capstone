const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

const getReportsDashboard = async (req, res) => {
  try {
    let hotelMatch = {};

    if (req.user.role === 'hotel_manager') {
      const myHotels = await Hotel.find({ manager: req.user._id }).select('_id');
      const hotelIds = myHotels.map((h) => h._id);
      hotelMatch = { hotel: { $in: hotelIds } };
    }

    const overallStats = await Booking.aggregate([
      { $match: hotelMatch },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'confirmed'] }, '$totalPrice', 0]
            }
          },
          totalNightsBooked: {
            $sum: {
              $cond: [{ $eq: ['$status', 'confirmed'] }, '$totalDays', 0]
            }
          }
        }
      }
    ]);

    const revenueByHotel = await Booking.aggregate([
      {
        $match: {
          ...hotelMatch,
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: '$hotel',
          totalRevenue: { $sum: '$totalPrice' },
          bookingsCount: { $sum: 1 },
          nightsCount: { $sum: '$totalDays' },
          avgBookingValue: { $avg: '$totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel'
        }
      },
      { $unwind: '$hotel' },
      {
        $project: {
          hotelId: '$_id',
          hotelName: '$hotel.name',
          city: '$hotel.city',
          totalRevenue: 1,
          bookingsCount: 1,
          nightsCount: 1,
          avgBookingValue: { $round: ['$avgBookingValue', 2] }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    const occupancyReport = await Booking.aggregate([
      {
        $match: {
          ...hotelMatch,
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: '$hotel',
          totalBookings: { $sum: 1 },
          bookedRooms: { $addToSet: '$room' }
        }
      },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel'
        }
      },
      { $unwind: '$hotel' },
      {
        $lookup: {
          from: 'rooms',
          localField: '_id',
          foreignField: 'hotel',
          as: 'rooms'
        }
      },
      {
        $project: {
          hotelId: '$_id',
          hotelName: '$hotel.name',
          city: '$hotel.city',
          totalRooms: { $size: '$rooms' },
          roomsBooked: { $size: '$bookedRooms' },
          totalBookings: 1,
          occupancyRate: {
            $cond: [
              { $gt: [{ $size: '$rooms' }, 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: [{ $size: '$bookedRooms' }, { $size: '$rooms' }] },
                      100
                    ]
                  },
                  1
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { occupancyRate: -1 } }
    ]);

    const summary = overallStats[0] || {
      totalBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0,
      totalNightsBooked: 0
    };

    res.json({
      summary,
      revenueByHotel,
      occupancyReport
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReportsDashboard
};
