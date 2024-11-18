async function checkIfVoterHasVotedOnAllBallots(voterName){
    let endpoint = 'votedOnAllBallots';
    let queryString = `?voterName=${voterName}`;
    return await getData(endpoint, queryString);
}

async function getVoters(){
    showLoading();
    let endPoint = 'getVoters';
    let toReturn = await getData(endPoint);
    hideLoading();
    return toReturn;
}

async function deleteVoterLogic(){
    let elementID = 'voterToDelete';
    let actionURL = 'deleteVoter';
    let key = 'name';
    await deleteLogic(elementID, actionURL, key);
}

async function recordVote(){
    let candidateSelection = getElement('candidateSelection').value;
    let voterName = getElement('voterName').value;
    let ballotID = getElement('ballotID').value;
    if(candidateSelection === ''){
        getElement('snackbar').innerText = 'You must select a candidate to vote for. Your vote was not recorded.';
        hideModal();
        await delay(1000);
        snackbar();
    } else {
        try {
            let endpoint = 'recordVote';
            let init = {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({voterName: voterName, candidateSelection: candidateSelection, ballotID: ballotID})
            };
            const response = await sendRequest(endpoint, init);
            console.log('Vote recorded successfully:', response);
        } catch (error){
            if(error.message.includes('Error') && error.message.includes('503')){
                console.error(`${voterName} has already voted on Ballot with ballotID ${ballotID}`);
                getElement('snackbar').innerText = `${voterName} has already voted on Ballot with ballotID ${ballotID}`;
                snackbar();
            }
        } finally {
            await loadData();
        }
    }
    hideModal();
}

async function updateVote(){
    let candidateSelection = getElement('candidateSelection').value;
    let voterName = getElement('voterName').value;
    let ballotID = getElement('ballotID').value;
    if(candidateSelection === ''){
        getElement('snackbar').innerText = 'You must select a candidate to vote for. Your vote was not recorded.';
        hideModal();
        await delay(1000);
        snackbar();
    } else {
        try {
            let endpoint = 'updateVote';
            let init = {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({voterName: voterName, candidateSelection: candidateSelection, ballotID: ballotID})
            };
            const response = await sendRequest(endpoint, init);
            console.log('Vote recorded successfully:', response);
        } catch (error){
            if(error.message.includes('Error') && error.message.includes('503')){
                console.error(`${voterName} has already voted on Ballot with ballotID ${ballotID}`);
                getElement('snackbar').innerText = `${voterName} has already voted on Ballot with ballotID ${ballotID}`;
                snackbar();
            }
        } finally {
            await loadData();
        }
    }
    hideModal();
}

async function deleteSingleVotersVote(){
    let voterName = getElement('voterName').value;
    let ballotID = getElement('ballotIDToChange').value;
    try {
        let endpoint = 'deleteVote';
        let init = {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({voterName: voterName, ballotID: ballotID})
        };
        const response = await sendRequest(endpoint, init);
        let ballotResult = response.ballotResult;
        let voterResult = response.voterResult;
        if(ballotResult.modifiedCount === 0 || voterResult.modifiedCount === 0){
            console.log('No error occurred but nothing was changed', response);
        } else {
            console.log('Vote deleted successfully:', response);
        }
    } catch (error){
        console.error(`Error deleting vote`, error);
        getElement('snackbar').innerText = `Error deleting vote`;
        snackbar();
    } finally {
        await loadData();
    }
    getElement('ballotIDToChange').value = '';
}