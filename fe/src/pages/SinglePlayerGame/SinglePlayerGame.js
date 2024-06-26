import React, { useEffect, useState } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import axios from 'axios';
import useSound from 'use-sound'; // Sound library

import './Game.css';
const GeolocationTracker = () => {
    const getInitialPosition = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.location) {
            //placeTreasures(user.location.latitude, user.location.longitude)
            return [user.location.latitude, user.location.longitude];
        }
        return [51.505, -0.09];
    };

    //const collectSound = useSound('/sounds/collect_treasure.mp3');
    const [collectSound] = useSound('/sounds/collect_treasure.mp3')

    const placeTreasures = (latitude, longitude) => {
        const newTreasures = [];
        const numTreasures = 10;


        const radiusInDegreesNear = 0.0003;
        const radiusInDegreesFar = 0.0015;

        for (let i = 0; i < numTreasures; i++) {
            let latOffset, lngOffset;
            if (i % 2 === 0) {
                latOffset = (Math.random() - 0.5) * 1 * radiusInDegreesNear;
                lngOffset = (Math.random() - 0.5) * 1 * radiusInDegreesNear;
            } else {

                latOffset = (Math.random() - 0.5) * 1 * radiusInDegreesFar;
                lngOffset = (Math.random() - 0.5) * 1 * radiusInDegreesFar;
            }

            const lat = latitude + latOffset;
            const lng = longitude + lngOffset;

            newTreasures.push({ id: i, latitude: lat, longitude: lng });
        }

        return newTreasures
        //setTreasures(newTreasures);
    }

    const setInitialTreasures = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.location) {
            return placeTreasures(user.location.latitude, user.location.longitude)
    }}

    const getValues = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            return user.inserted_id
        }
    }

    const [userId, setUserId] = useState(null);
    const [inserted_id, setInserted_id] = useState(getValues())
    const [position, setPosition] = useState(getInitialPosition());
    const [treasures, setTreasures] = useState(setInitialTreasures());
    const [score, setScore] = useState(0)



    const handleCollectTreasure = (treasure) => {

        //this position is always updated to the current value using the watch position
        //all the treasure markers are fixed

        if (!position) {
            alert('Waiting for location data...');
            return;
        }

        const distance = calculateDistance(position[0], position[1], treasure.latitude, treasure.longitude);

        if (distance <= 20) {
            const updatedTreasures = treasures.filter(item => item.id !== treasure.id);
            setTreasures(updatedTreasures);
            setScore(score + 1);
            axios.post(`${process.env.REACT_APP_API_SERVICE_URL}/update-user-score`, {
                inserted_id: inserted_id,
                score: score + 1,
            })
                .then((response) => {
                    console.log('score updated:', response.data);
                })
                .catch((error) => {
                    console.error('Error updating location:', error);
                });


        } else {
            alert('You are too far from the treasure to collect it!');
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        const distance = R * c;

        return distance;
    };

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
                    setPosition([latitude, longitude]);  //current position variable is always getting updated
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

    // return (
    //     <><h1>Hi, {userId}, This is your current position</h1>
    //         <Map height={600} defaultCenter={position}  defaultZoom={13}>
    //             <Marker
    //                 width={50}
    //                 anchor={position}
    //                 color={color}
    //                 onClick={() => setHue(hue + 20)}
    //
    //             >
    //             </Marker>
    //         </Map>
    //     </>
    // )

    return (
        <div className="game-container">
            <h1 className="game-title">Treasure Hunt Game</h1>
            <p className="game-title">
                      Score: {score} <i className="fas fa-gem treasure-icon"></i>
            </p>
            {position ? (
                <Map defaultCenter={position} zoom={16} width={'100%'} height={600}>
                    <Marker anchor={position} color="blue" />

                    {treasures.map((treasure) => (
                        <Marker
                            key={treasure.id}
                            anchor={[treasure.latitude, treasure.longitude]}
                            color="red"
                            onClick={() => {
                                handleCollectTreasure(treasure)
                               // {collectSound}; // Play sound on collect
                            }}
                        />
                    ))}
                </Map>
            ) : (
                <p className="waiting-message">Waiting for location data...</p>
            )}
        </div>
    );
};

export default GeolocationTracker;
