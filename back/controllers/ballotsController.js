const { insertDocument, queryCollection, distinctField, getDocument, deleteDocument, updateDocument} = require('../logic/dbService');
const { connectToDb } = require('../config/dbConfig');

async function getAllBallots(request, response) {
    try {
        const ballots = await queryCollection('ballots', {});
        response.send(ballots);
    } catch (error) {
        response.status(500).send('Error fetching ballots');
    }
}

// Get a specific ballot by ID
async function getBallot(request, response) {
    const ballotID = parseInt(request.query.id);
    try {
        const results = await queryCollection('ballots', { ballotID });
        response.send(results);
    } catch (error) {
        console.error('Error fetching ballot:', error);
        response.status(500).send('Error fetching ballot');
    }
}

//get all ballot ids
async function getAllBallotIDS(request, response) {
    try {
        const results = await distinctField('ballots', 'ballotID');
        response.send(results);
    } catch (error) {
        console.error(error);
        response.status(500).send('Error fetching ballotIDS');
    }
}

//check whether as voter has voted on all available ballots
async function getVotedOnAllBallots(request, response) {
    const voterName = request.query.voterName;
    try {
        const allBallotIDS = await distinctField('ballots', 'ballotID');
        if(Object.entries(allBallotIDS).length === 0){
            response.send(false);
        } else {
            const [voterInfo] = await queryCollection('voters', { name: voterName });
            if (!voterInfo || !voterInfo.ballotsVotedOn) {
                return response.send(false);
            }
            const ballotsVotedOnSet = new Set(voterInfo.ballotsVotedOn);
            const allBallotIDSSet = new Set(allBallotIDS);
            const isSubset = [...allBallotIDSSet].every(id => ballotsVotedOnSet.has(id));
            response.send(isSubset || allBallotIDSSet.size === ballotsVotedOnSet.size);
        }
    } catch (error) {
        console.error(error);
        response.status(500).send('Error checking voted ballots');
    }
}

async function getVotedOnBallotIDS(request, response) {
    const voterName = request.query.voterName;
    try {
        const voter = await getDocument('voters', { name: voterName });
        if (voter.ballotsVotedOn) {
            response.send(voter.ballotsVotedOn);
        } else {
            response.send([]);
        }
    } catch (error) {
        console.error('Error fetching ballot IDs:', error);
        response.status(500).send('Error fetching ballot IDs');
    }
}

async function createBallot(request, response) {
    try {
        const candidatesList = request.body.candidates;
        let newBallotID = await highestBallotID();

        const ballotData = {
            ballotID: newBallotID + 1,
            candidates: candidatesList.reduce((acc, candidate, index) => {
                acc[index + 1] = candidate;
                return acc;
            }, {}),
            results: candidatesList.reduce((acc, candidate) => {
                acc[candidate] = 0;
                return acc;
            }, {}),
        };

        const result = await insertDocument('ballots', ballotData);
        response.send(result);
    } catch (error) {
        response.status(500).send('Error creating ballot');
    }
}

async function deleteBallot(request, response){
    const ballotID = request.body.ballotID;
    try {
        await removeBallotFromVoters(ballotID);
        const result = await deleteDocument('ballots', { ballotID: parseInt(ballotID) });
        response.send(result);
    } catch (error) {
        console.error('Error deleting ballot:', error);
        response.status(500).send('Error deleting ballot');
    }
}

async function removeBallotFromVoters(ballotID){
    const voters = await getDocument('voters', {}, 1);
    for (const voter of voters) {
        const voterFilter = { name: voter.name };
        const voterUpdateDocument = {
            $pull: {
                ballotsVotedOn: parseInt(ballotID),
                ballotsCast: { ballotID: parseInt(ballotID) },
            }
        };
        await updateDocument('voters', voterFilter, voterUpdateDocument);
    }
}

async function highestBallotID() {
    try {
        const db = await connectToDb();
        const ballot = await db.collection('ballots')
            .find({})
            .sort({ ballotID: -1 })
            .limit(1)
            .toArray();
        return ballot.length > 0 ? ballot[0].ballotID : 0;
    } catch (error) {
        console.error('Error fetching highest ballot ID:', error);
        throw error;
    }
}

module.exports = { getAllBallots, getBallot, getAllBallotIDS, getVotedOnAllBallots, getVotedOnBallotIDS, createBallot, deleteBallot };
