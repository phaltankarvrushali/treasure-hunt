import React from "react";
import { SwipeableFlatList } from "react-native";
import UserItem from "./UserItem";
import { View, Image, Text, StyleSheet } from "react-native";

const UserList = ({ users }) => {
    return (
        <SwipeableFlatList
            data={users}
            bounceFirstRowOnMount={true}
            maxSwipeDistance={160}
            renderItem={UserItem}
            //ListHeaderComponent={ListHeader}
        />
    );
};

const ListHeader = () => (
    <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Username</Text>
        <Text style={styles.headerText}>Score</Text>
    </View>
);

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#f8f8f8',
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    rowIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    rowData: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowDataText: {
        fontSize: 16,
    },
});
export default UserList;
