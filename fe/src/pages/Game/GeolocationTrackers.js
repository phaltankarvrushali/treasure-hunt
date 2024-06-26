import React, { useEffect, useState } from 'react';
import { Map, Marker } from 'pigeon-maps';
import axios from 'axios';
import UserList from "../Users/UserList";
import { ScrollView, StyleSheet, ActivityIndicator } from "react-native";

const GeolocationTracker = () => {
    const getInitialPosition = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.location) {
            return [user.location.latitude, user.location.longitude];
        }
        return [51.505, -0.09];
    };

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
            return user.inserted_id;
        }
        return null;
    }

    const getUserIdValue = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            return user.userId;
        }
        return null;
    }


    const [userId, setUserId] = useState(getUserIdValue());
    const [inserted_id, setInserted_id] = useState(getValues());
    const [position, setPosition] = useState(getInitialPosition());
    const [allUsersLocations, setAllUsersLocations] = useState([]);
    const [treasures, setTreasures] = useState(setInitialTreasures());
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [users, setUsers] = useState([]);

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
                    console.log({ latitude, longitude });
                    console.log({ inserted_id });
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
        const timer = setInterval(() => {
            setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchAllUsersLocations();
        }, 2000); // Fetch locations every 5 seconds

        return () => clearInterval(intervalId);
    }, []);

    const updateUserLocation = (latitude, longitude) => {
        const session = JSON.parse(localStorage.getItem('user'));
        if (session) {
            session.location = { latitude, longitude };
            console.log(inserted_id);
            localStorage.setItem('user', JSON.stringify(session));

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



    const fetchAllUsersLocations = () => {
        //const otherUserIds = ['user1', 'user2']; // Replace with actual user IDs
        axios.get(`${process.env.REACT_APP_API_SERVICE_URL}/user-results`, {

        })
            .then((response) => {
                const { users } = response.data;
                const locations = users.map(user => JSON.parse(user.geolocation));

                setUsers(users);
                console.log(locations);
                console.log(users);
                setAllUsersLocations(locations);
            })
            .catch((error) => {
                console.error('Error fetching other users\' locations:', error);
            });
    };

    const [hue, setHue] = useState(0);
    const color = `hsl(${hue % 360}deg 39% 70%)`;

    return (
        <>
            <div >

                <h1 className="game-title">Treasure Hunt Game</h1>
                <p className="game-title">
                    Your Score: {score} <i className="fas fa-gem treasure-icon"></i>
                </p>
                <div className="timer" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
                </div>
                <ScrollView>
                        <UserList users={users} />

                </ScrollView>
            <Map height={600} defaultCenter={position} defaultZoom={13}>
                {allUsersLocations.map((userLocation, index) => (
                    <Marker
                        key={index}
                        width={50}
                        anchor={[userLocation.latitude, userLocation.longitude]}
                        color={`hsl(${(hue + 60 * (index + 1)) % 360}deg 39% 70%)`}
                    />
                ))}
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
            </div>
        </>
    );
};

export default GeolocationTracker;
