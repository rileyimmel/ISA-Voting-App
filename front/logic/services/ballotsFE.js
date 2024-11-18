async function getBallots(){
    showLoading();
    let endPoint = 'getBallots';
    let toReturn = await getData(endPoint);
    hideLoading();
    return toReturn;
}

async function getVotedOnBallotIDS(voterName){
    let endPoint = 'getVotedOnBallotIDS';
    let queryString = `?voterName=${voterName}`;
    return await getData(endPoint, queryString);
}

async function deleteBallotLogic(){
    let elementID = 'ballotToDelete';
    let actionURL = 'deleteBallot';
    let key = `ballotID`;
    await deleteLogic(elementID, actionURL, key);
}

//get a single ballot by ballotID from api (node.js server)
async function getSingleBallot(ballotID){
    showLoading();
    let endpoint = 'getBallot';
    let queryString = `?id=${ballotID}`;
    let ballot = await getData(endpoint, queryString);
    hideLoading();
    return ballot[0];
}

let newBallotChoices = [];

function addNewBallotChoice(candidateName){
    let btn = getElement(candidateName);
    if(btn.className === 'btn btn-secondary'){
        btn.className = 'btn btn-primary';
        newBallotChoices.push(candidateName);
    } else {
        btn.className = 'btn btn-secondary';
        newBallotChoices.splice(newBallotChoices.indexOf(candidateName));
    }
}

async function makeNewBallot(){
    try {
        let endpoint = 'newBallot';
        let init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({candidates: newBallotChoices})
        };
        const response = await sendRequest(endpoint, init);
        console.log('New Ballot created successfully:', response);
        hideModal();
    } catch (error){
        console.error(error);
    } finally {
        await loadData();
    }
}