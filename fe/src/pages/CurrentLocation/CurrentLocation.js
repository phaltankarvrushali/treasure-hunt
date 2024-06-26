import React from 'react';
import GeolocationTracker from './GeolocationTracker';

const CurrentLocation = () => {
    return (
        <div>
            <h1>Welcome, This your current location</h1>
            <GeolocationTracker />
        </div>
    );
};

export default CurrentLocation;
