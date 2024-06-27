import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import UserList from "./UserList";
import axios from "axios";

const UHome = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = {
                    'ngrok-skip-browser-warning': 'any_value_here', // Set it to any non-empty value'Content-Type': 'application/json'// Set appropriate content type if sending JSON payload
                };
                const response = await axios.get("https://3b57-155-33-133-48.ngrok-free.app/user-results", { headers })
                console.log('These are the current users', response.data);
                const { users } = response.data;
                setUsers(users);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching the users:', error);
            }
        };

        fetchData(); // Initial fetch

        const intervalId = setInterval(fetchData, 2000); // Fetch data every 2 seconds

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);

    return (
        <ScrollView noSpacer={true} noScroll={true} style={styles.container}>
            {loading ? (
                <ActivityIndicator
                    style={[styles.centering]}
                    color="#ff8179"
                    size="large"
                />
            ) : (
                <UserList users={users} />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "whitesmoke",
        marginTop: '60px'
    },
    centering: {
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        height: "100vh"
    }
});

export default UHome;
