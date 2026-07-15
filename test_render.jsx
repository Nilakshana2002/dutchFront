import { renderToString } from 'react-dom/server';
import React, { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import SemiLuxuryRooms from './src/pages/semiLuxuryRooms.jsx';
import LuxuryRooms from './src/pages/luxuryRooms.jsx';

import * as api from './src/utils/api.js';

// Mock the API calls
api.fetchRoomsByCategory = async () => [{ _id: '1', name: 'Room 1', price: 10000, guests: 2, capacity: '2 Guests' }];
api.fetchActiveOffers = async () => [];
api.fetchMealPlans = async () => [{ code: 'room-only', label: 'Room Only', rate: 0 }];

try {
    const html = renderToString(
        <MemoryRouter initialEntries={[{ pathname: '/semi-luxury-rooms', state: { checkIn: '2026-07-20', checkOut: '2026-07-22' } }]}>
            <SemiLuxuryRooms />
        </MemoryRouter>
    );
    console.log("Render successful!");
} catch (error) {
    console.error("Render failed:");
    console.error(error);
}
