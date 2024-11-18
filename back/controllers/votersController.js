const { insertDocument, deleteDocument, getDocument, updateDocument, queryCollection } = require('../logic/dbService');
const { Int32 } = require('mongodb');
const {connectToDb} = require("../config/dbConfig");

async function getAllVoters(request, response){
    try {
        const voter = await queryCollection('voters');
        response.send(voter);
    } catch (error) {
        response.status(500).send('Error fetching voters');
    }
}

async function getVoter(request, response){
    let voterName = request.query.voterName;
    try {
        const voter = await queryCollection('voters', { name: voterName });
        response.send(voter);
    } catch (error) {
        response.status(500).send('Error fetching voter');
    }
}

async function createVoter(request, response) {
    try {
        let newVoterName = request.body.name;
        const voterData = { name: newVoterName };
        let currentVoters = await queryCollection('voters');
        currentVoters = Object.entries(currentVoters);
        let safeToAdd = true;
        currentVoters.forEach(voter => {
            let voterData = voter[1];
            if(voterData.name === newVoterName){
                safeToAdd = false;
                response.statusMessage = 'Error creating new voter; a voter with that name already exists';
                response.status(500).send();
            }
        });
        if(safeToAdd){
            const result = await insertDocument('voters', voterData);
            await incrementVotesLeftToCast();
            response.send(result);
        }
    } catch (error) {
        console.error('Error creating new voter');
    }
}

async function incrementVotesLeftToCast() {
    try {
        const result = await updateDocument('info', { name: 'infoDoc' }, { $inc: { votesLeftToCast: 1 } });
    } catch (error){
        console.error('Error incrementing votesLeftToCast');
    }
}

async function decrementVotesLeftToCast() {
    try {
        const result = await updateDocument('info', { name: 'infoDoc' }, { $inc: { votesLeftToCast: -1 } });
    } catch (error){
        console.error('Error decrementing votesLeftToCast');
    }
}

// Delete a voter and remove their votes
async function deleteVoter(request, response) {
    const voterName = request.body.name;
    try {
        await removeVotersVotes(voterName);
        const result = await deleteDocument('voters', { name: voterName });
        response.send(result);
    } catch (error) {
        console.error('Error deleting voter:', error);
        response.status(500).send('Error deleting voter');
    }
}

async function putRecordVote(request, response) {
    const candidateSelection = request.body.candidateSelection;
    const voterName = request.body.voterName;
    const ballotID = parseInt(request.body.ballotID);

    let alreadyVoted = await hasVoterVotedOnThisBallot(voterName, ballotID);
    if (alreadyVoted) {
        response.status(503).send('Already voted');
        return;
    }

    const voterFilter = { name: voterName };
    const voterUpdateDocument = {
        $addToSet: {
            ballotsVotedOn: ballotID,
            ballotsCast: { ballotID: ballotID, candidate: candidateSelection }
        }
    };

    const ballotFilter = { ballotID: ballotID };
    const ballotUpdateDocument = {
        $inc: { [`results.${candidateSelection}`]: 1 },
        $addToSet: {
            voters: voterName
        }
    };

    try {
        const ballotResult = await updateDocument('ballots', ballotFilter, ballotUpdateDocument);
        const voterResult = await updateDocument('voters', voterFilter, voterUpdateDocument);
        await decrementVotesLeftToCast();
        response.send({ ballotResult, voterResult });
    } catch (error) {
        console.error('Update failed:', error);
        response.status(500).send('Update Failed');
    }
}

async function putUpdatedVote(request, response) {
    const candidateSelection = request.body.candidateSelection;
    const voterName = request.body.voterName;
    const ballotID = parseInt(request.body.ballotID);
    const voterFilter = { name: voterName, "ballotsCast.ballotID": ballotID };
    const voterUpdateDocument = {
        $set: {
            "ballotsCast.$.candidate": candidateSelection
        }
    };
    const ballotFilter = { ballotID: ballotID };
    try {
        const voter = await getDocument('voters', voterFilter);
        const oldCandidateSelection = voter.ballotsCast.find(ballot => ballot.ballotID === ballotID).candidate;
        if(candidateSelection === oldCandidateSelection){
            response.send({result: 'No change; same candidate selected'});
            return;
        }
        const ballotUpdateDocument = {
            $inc: {
                [`results.${oldCandidateSelection}`]: -1,
                [`results.${candidateSelection}`]: 1
            }
        };
        const ballotResult = await updateDocument('ballots', ballotFilter, ballotUpdateDocument);
        const voterResult = await updateDocument('voters', voterFilter, voterUpdateDocument);
        response.send({ ballotResult, voterResult });
    } catch (error) {
        console.error('Update failed:', error);
        response.status(500).send('Update Failed');
    }
}

async function hasVoterVotedOnThisBallot(voterName, ballotID) {
    try {
        const result = await getDocument('voters', { name: voterName, ballotsVotedOn: ballotID });
        return result !== null;
    } catch (error) {
        console.error('Error checking if voter has voted on this ballot:', error);
        throw new Error('Error checking if voter has voted on this ballot');
    }
}

async function removeVotersVotes(voterName){
    let ballots = await getVoterBallots(voterName);
    for (const ballot of ballots) {
        await removeSingleVote(ballot);
    }
}

async function removeSingleVote(ballot){
    const ballotFilter = { ballotID: ballot.ballotID };
    const ballotUpdateDocument = { $inc: { [`results.${ballot.candidate}`]: -1 }};
    await updateDocument('ballots', ballotFilter, ballotUpdateDocument);
}

async function deleteVotersVote(request, response) {
    const voterName = request.body.voterName;
    const ballotID = parseInt(request.body.ballotID);
    try {
        const ballots = await getVoterBallots(voterName);
        const ballot = ballots.find(ballot => ballot.ballotID === ballotID);
        if (ballot) { await removeSingleVote(ballot) }
        const ballotFilter = { ballotID: ballotID };
        const ballotUpdateDocument = { $pull: { voters: voterName } };
        const ballotResult = await updateDocument('ballots', ballotFilter, ballotUpdateDocument);
        const voterFilter = { name: voterName };
        const voterUpdateDocument = {
            $pull: {
                ballotsCast: { ballotID: ballotID },
                ballotsVotedOn: ballotID
            }
        };
        const voterResult = await updateDocument('voters', voterFilter, voterUpdateDocument);
        response.send({ ballotResult, voterResult });
    } catch (error) {
        console.error('Failed to remove voter\'s vote:', error);
        response.status(500).send('Failed to remove voter\'s vote');
    }
    await incrementVotesLeftToCast();
}

async function getVoterBallots(voterName){
    try {
        const voter = await getDocument('voters', { name: voterName });
        return voter.ballotsCast ? voter.ballotsCast : [];
    } catch (error) {
        console.error('Error retrieving voter ballots:', error);
        return [];
    }
}

module.exports = { getAllVoters, getVoter, createVoter, deleteVoter, putRecordVote, putUpdatedVote, deleteVotersVote };