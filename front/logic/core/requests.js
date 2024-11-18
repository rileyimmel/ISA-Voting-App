const actions = {
    'getVoters':'http://localhost/api/getAllvoters',
    'getVoter':'http://localhost/api/getVoter',
    'getCandidates':'http://localhost/api/candidates',
    'getBallots':'http://localhost/api/ballots',
    'getBallot':'http://localhost/api/ballot',
    'getAllBallotIDS':'http://localhost/api/allBallotIDS',
    'getVotedOnBallotIDS':'http://localhost/api/votedOnBallotIDS',
    'getVotesLeftToCast':'http://localhost/api/candidates/ballots',
    'newVoter':'http://localhost/api/newVoter',
    'newCandidate':'http://localhost/api/newCandidate',
    'newBallot':'http://localhost/api/newBallot',
    'recordVote':'http://localhost/api/recordVote',
    'updateVote':'http://localhost/api/updateVote',
    'votedOnAllBallots':'http://localhost/api/votedOnAllBallots',
    'deleteVoter':'http://localhost/api/deleteVoter',
    'deleteVote':'http://localhost/api/deleteVote',
    'deleteCandidate':'http://localhost/api/deleteCandidate',
    'deleteBallot':'http://localhost/api/deleteBallot',
    'candidatesTotals':'http://localhost/api/candidatesTotals',
}

async function getData(endPoint, queryString = ''){
    return await fetch( actions[endPoint] + queryString)
        .then(response => response.json());
}

async function sendRequest(endpoint, init = {}, jsonify = true){
    if(!jsonify){
        return await fetch(actions[endpoint], init);
    } else {
        return await fetch(actions[endpoint], init)
            .then(response => response.json());
    }
}