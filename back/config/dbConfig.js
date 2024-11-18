const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function connectToDb() {
    try {
        await client.connect();
        return client.db('voting');
    } catch (error) {
        console.error('Failed to connect to database', error);
        throw error;
    }
}

async function closeConnection() {
    try {
        await client.close();
    } catch (error) {
        console.error('Failed to close database connection', error);
    }
}

module.exports = { connectToDb, closeConnection };
