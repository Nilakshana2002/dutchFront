import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const QuickBookingBar = () => {
    const navigate = useNavigate()
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [guests, setGuests] = useState('1')
    const [roomType, setRoomType] = useState('deluxeRooms')

    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    const handleCheckAvailability = () => {
        if (!checkIn) {
            toast.error('Please select check-in date')
            return
        }

        const isDayUse = !checkOut;
        const targetPath = `/${roomType}`;

        navigate(targetPath, {
            state: {
                checkIn,
                checkOut: isDayUse ? checkIn : checkOut,
                guests,
                isDayUse
            }
        })
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-navy-200/50 p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
                     
                    <div className="md:col-span-1">
                        <label className="block text-sm font-semibold text-navy-900 mb-2">
                            Check In
                        </label>
                        <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            min={today}
                            className="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 text-navy-900 font-medium"
                        />
                    </div>

        
                    <div className="md:col-span-1">
                        <label className="block text-sm font-semibold text-navy-900 mb-2">
                            Check Out
                        </label>
                        <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            min={checkIn || tomorrow}
                            className="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 text-navy-900 font-medium"
                        />
                    </div>

                     
                    <div className="md:col-span-1">
                        <label className="block text-sm font-semibold text-navy-900 mb-2">
                            Guests
                        </label>
                        <select
                            value={guests}
                            onChange={(e) => setGuests(e.target.value)}
                            className="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 text-navy-900 font-medium appearance-none bg-white cursor-pointer"
                        >
                            <option value="1">1 Guest</option>
                            <option value="2">2 Guests</option>
                            <option value="3">3 Guests</option>
                            <option value="4">4 Guests</option>
                            <option value="5">5+ Guests</option>
                        </select>
                    </div>

                     
                    <div className="md:col-span-1">
                        <label className="block text-sm font-semibold text-navy-900 mb-2">
                            Room Type
                        </label>
                        <select
                            value={roomType}
                            onChange={(e) => setRoomType(e.target.value)}
                            className="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 text-navy-900 font-medium appearance-none bg-white cursor-pointer"
                        >
                            <option value="deluxeRooms">Deluxe Rooms</option>
                            <option value="semiLuxuryRooms">Semi-Luxury Rooms</option>
                            <option value="luxuryRooms">Luxury Rooms</option>
                            <option value="DayOutingRooms">Day Outing Packages</option>
                        </select>
                    </div>

                     
                    <div className="md:col-span-1 flex items-end">
                        <button
                            onClick={handleCheckAvailability}
                            className="w-full bg-gradient-to-r from-navy-700 to-navy-900 text-white px-6 py-3 rounded-xl font-bold text-lg hover:from-navy-800 hover:to-navy-950 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Check Availability
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QuickBookingBar
