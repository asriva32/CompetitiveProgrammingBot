const mongoose = require('mongoose');
const Handle = require('/Users/arnavsrivastava/Desktop/CompetitiveProgrammingBot/models/handles');

async function getHandle(username){
	try {
		const doc = await Handle.findOne({ user: username });
		if (doc) {
			console.log('User exists:', doc);
			return doc.handle;
		} else {
			console.log('User does not exist');
			return null;
		}
	} catch (error) {
		console.error('Error finding handle by username:', error);
		throw error;
	}
}

async function getUser(handle) {
	try {
		const doc = await Handle.findOne({ handle: handle });
		if (doc) {
			console.log('Handle exists:', doc);
			return doc.user;
		} else {
			console.log('Handle does not exist');
			return null;
		}
	} catch (error) {
		console.error('Error finding user by handle:', error);
		throw error;
	}
}

async function checkCodeforcesHandle(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            console.log('Handle exists:', data.result[0]);
            return true;
        } else {
            console.log('Handle does not exist');
            return false;
        }
    } catch (error) {
        console.error('Error checking handle on Codeforces:', error);
        throw error;
    }
}

async function addHandle(userName, userHandle) {
    try {
        const newHandle = new Handle({
            user: userName,
            handle: userHandle
        });
        const savedHandle = await newHandle.save();
        console.log('Handle added:', savedHandle);
        return savedHandle;
    } catch (error) {
        console.error('Error adding handle to MongoDB:', error);
        throw error;
    }
}

module.exports = {
	getHandle,
	getUser,
	checkCodeforcesHandle,
	addHandle
};