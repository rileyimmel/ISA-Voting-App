const { insertDocument, queryCollection, updateDocument, getDocument, deleteDocument} = require('../logic/dbService');

// Get all candidates
async function getAllCandidates(request, response) {
    try {
        const candidates = await queryCollection('candidates', {});
        response.send(candidates);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        response.status(500).send('Error fetching candidates');
    }
}

// Create a new candidate
async function createCandidate(request, response) {
    try {
        let newCandidateName = request.body.name;
        const candidateData = { name: newCandidateName, votesReceived: 0 };
        let currentCandidates = await queryCollection('candidates');
        currentCandidates = Object.entries(currentCandidates);
        let safeToAdd = true;
        currentCandidates.forEach(candidate => {
            let candidateData = candidate[1];
            if(candidateData.name === newCandidateName){
                safeToAdd = false;
                response.statusMessage = 'Error creating new candidate; a candidate with that name already exists';
                response.status(500).send();
            }
        });
        if(safeToAdd){
            const result = await insertDocument('candidates', candidateData);
            response.send(result);
        }
    } catch (error) {
        console.error('Error creating new candidate');
    }
}

// Delete a candidate
async function deleteCandidate(request, response) {
    const candidateName = request.body.name;
    try {
        await removeCandidateFromBallots(candidateName);
        const result = await deleteDocument('candidates', { name: candidateName });
        response.send(result);
    } catch (error) {
        console.error('Error deleting candidate:', error);
        response.status(500).send('Error deleting candidate');
    }
}

async function removeCandidateFromBallots(candidateName){
    let ballots = await getBallotsWithCandidate(candidateName);
    for (const ballot of ballots) {
        const candidateKey = parseInt(Object.keys(ballot.candidates).find(key => ballot.candidates[key] === candidateName));
        const ballotFilter = { ballotID: parseInt(ballot.ballotID) };
        const ballotUpdateDocument = { $unset: { [`candidates.${candidateKey}`]: '', [`results.${candidateName}`]: '' }};
        await updateDocument('ballots', ballotFilter, ballotUpdateDocument);
    }
    await checkForEmptyBallots();
}

async function checkForEmptyBallots(){
    try {
        const ballots = await getDocument('ballots', {}, 1);
        for(const ballot of ballots ){
            let candidatesList = Object.values(ballot.candidates);
            if(candidatesList.length < 1){
                await deleteDocument('ballots', {ballotID: ballot.ballotID});
            }
        }
    } catch (error) {
        console.error('Error deleting empty ballot(s):', error);
    }
}

async function getBallotsWithCandidate(candidateName){
    try {
        const ballots = await getDocument('ballots', {}, 1);
        let ballotsWithCandidate = [];
        for(const ballot of ballots ){
            let candidatesList = Object.values(ballot.candidates);
            if(candidatesList.includes(candidateName)){
                ballotsWithCandidate.push(ballot);
            }
        }
        return ballotsWithCandidate ?? [];
    } catch (error) {
        console.error('Error retrieving ballots during candidate deletion:', error);
        return [];
    }
}

async function getVotesLeftToCast(request, response) {
    try {
        const votes = await queryCollection('info', {});
        response.send({votesLeftToCast: votes[0]['votesLeftToCast']});
    } catch (error) {
        console.error('Error fetching candidates:', error);
        response.status(500).send('Error fetching candidates');
    }
}

async function getTotalVotesForAllCandidates(request, response) {
    try {
        const ballots = await getDocument('ballots', {}, 1);
        const totalVotes = {};
        ballots.forEach(ballot => {
            const results = ballot.results;
            for (const candidate in results) {
                if (totalVotes[candidate] === undefined) {
                    totalVotes[candidate] = results[candidate];
                } else {
                    totalVotes[candidate] += results[candidate];
                }
            }
        });
        response.send(totalVotes);
    } catch (error) {
        console.error('Failed to calculate total votes:', error);
        response.status(500).send('Failed to calculate total votes');
    }
}

module.exports = { getAllCandidates, getVotesLeftToCast, getTotalVotesForAllCandidates, createCandidate, deleteCandidate };