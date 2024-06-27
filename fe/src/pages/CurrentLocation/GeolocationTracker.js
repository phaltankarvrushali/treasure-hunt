import React, { useEffect, useState } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import axios from 'axios';
const GeolocationTracker = () => {
    const getInitialPosition = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.location) {
            return [user.location.latitude, user.location.longitude];
        }
        return [51.505, -0.09];
    };



    const getValues = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            return user.inserted_id
        }
    }

    const [userId, setUserId] = useState(null);
    const [inserted_id, setInserted_id] = useState(getValues())
    const [position, setPosition] = useState(getInitialPosition());



    useEffect(() => {

        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setUserId(user.userId);
            setInserted_id(user.inserted_id);
        }

        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setPosition([latitude, longitude]);
                    console.log({ latitude, longitude })
                    console.log({inserted_id})
                    console.log(position.coords.speed)
                    updateUserLocation(latitude, longitude);
                },
                (error) => {
                    console.error('Error watching position:', error);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 0,
                }
            );

            return () => {
                navigator.geolocation.clearWatch(watchId);
            };
        } else {
            console.log('Geolocation is not supported by this browser.');
        }
    }, []);

    const updateUserLocation = (latitude, longitude) => {
        const session = JSON.parse(localStorage.getItem('user')); //yes I can see these values on screen
        if (session) {
            session.location = { latitude, longitude };
            console.log(inserted_id)
            localStorage.setItem('user', JSON.stringify(session)); //updated in the local Storage

            axios.post(`${process.env.REACT_APP_API_SERVICE_URL}/update-user-location`, {
                inserted_id: inserted_id,
                location: { latitude, longitude },
            })
                .then((response) => {
                    console.log('Location updated:', response.data);
                })
                .catch((error) => {
                    console.error('Error updating location:', error);
                });
        }
    };



    const [hue, setHue] = useState(0)
    const color = `hsl(${hue % 360}deg 39% 70%)`

    return (
        <><h1>Hi {userId} This is your current position</h1>
        <Map height={600} defaultCenter={position}  defaultZoom={13}>
            <Marker
                width={50}
                anchor={position}
                color={color}
                onClick={() => setHue(hue + 20)}

            >
            </Marker>
        </Map>
        </>
    )
};

export default GeolocationTracker;
