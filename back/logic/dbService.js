const { connectToDb } = require('../config/dbConfig');

async function queryCollection(collectionName, query = {}, projection = {}) {
    const db = await connectToDb();
    return await db.collection(collectionName).find(query, { projection }).toArray();
}

async function getDocument(collectionName, filter, many = 0) {
    const db = await connectToDb();
    if(many !== 0){
        return await db.collection(collectionName).find(filter).toArray();
    } else {
        return await db.collection(collectionName).findOne(filter);
    }
}

async function insertDocument(collectionName, document) {
    const db = await connectToDb();
    return await db.collection(collectionName).insertOne(document);
}

async function updateDocument(collectionName, filter, updateDoc) {
    const db = await connectToDb();
    return await db.collection(collectionName).updateOne(filter, updateDoc);
}

async function deleteDocument(collectionName, filter) {
    const db = await connectToDb();
    return await db.collection(collectionName).deleteOne(filter);
}

async function distinctField(collectionName, field) {
    const db = await connectToDb();
    return await db.collection(collectionName).distinct(field);
}

module.exports = { queryCollection, getDocument, insertDocument, updateDocument, deleteDocument, distinctField, };
