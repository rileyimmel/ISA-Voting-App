const viewDiv = getElement('viewSelectorDiv');
const leftCol = getElement('leftCol');
const midCol = getElement('midCol');
const rightCol = getElement('rightCol');
const cdVoteDiv = getElement('changeDeleteVoteDiv');

function pageLoadView(){
    clearAllData();
    hideDiv(cdVoteDiv, false);
    showDiv(viewDiv, false);
}

function clearAllData(){
    getElement('voterName').value = '';
    getElement('candidateSelection').value = '';
    getElement('ballotID').value = '';
    getElement('voterToDelete').value = '';
    getElement('candidateToDelete').value = '';
    getElement('ballotToDelete').value = '';
    getElement('viewType').value = '';
    getElement('viewVoterName').value = '';
}

function resetView(){
    clearAllData();
    leftCol.innerHTML = '';
    midCol.innerHTML = '';
    rightCol.innerHTML = '';
    getElement('viewType').value = '';
    showDiv(viewDiv, false);
    hideDiv(cdVoteDiv, false);
}

async function adminView(){
    getElement('viewType').value = 'admin';
    clearCols();
    setAdminCols();
    showDiv('newBallotBtn', true);
    showDiv('deleteBallotBtn', true);
    showAllCols();
    hideDiv(viewDiv, false);
    hideDiv(cdVoteDiv, false);
    await loadData();
}

async function voterView(){
    getElement('viewType').value = 'voter';
    clearCols();
    setVoterCols();
    voterDivHides();
    hideDiv(leftCol, false);
    //display voters for selecting which voter to "login" as
    await votersModal(viewSave, false, true);
    await loadData();
}

async function viewSave(){
    getElement('viewVoterName').value = getElement('voterName').value;
    hideModal();
    showDiv(leftCol, false);
    showDiv(cdVoteDiv, false);
    hideDiv('ballotList', true);
    await displayVotersBallots(getElement('viewVoterName').value);
}

function showDiv(divID, byID = true){
    if(byID){
        getElement(divID).style.display = '';
    } else {
        divID.style.display = '';
    }
}

function hideDiv(divID, byID = true){
    if(byID){
        getElement(divID).style.display = 'none';
    } else {
        divID.style.display = 'none';
    }
}

function clearCols(){
    leftCol.innerHTML = '';
    midCol.innerHTML = '';
    rightCol.innerHTML = '';
}

function setAdminCols(){
    leftCol.appendChild(createVotersAlert());
    midCol.appendChild(createCandidatesAlert());
    rightCol.appendChild(createBallotsAlert());
}

function setVoterCols(){
    leftCol.appendChild(createBallotsAlert());
    midCol.appendChild(createVotersAlert());
    rightCol.appendChild(createCandidatesAlert());
}

function voterDivHides(){
    hideDiv(viewDiv, false);
    hideDiv(midCol, false);
    hideDiv(rightCol, false);
    hideDiv('newBallotBtn', true);
    hideDiv('deleteBallotBtn', true);
}

function showAllCols(){
    showDiv(leftCol, false);
    showDiv(midCol, false);
    showDiv(rightCol, false);
}

function hideAllCols(){
    showDiv(leftCol, false);
    showDiv(midCol, false);
    showDiv(rightCol, false);
}