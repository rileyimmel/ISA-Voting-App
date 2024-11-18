async function ballots(){
    let ballotData = await getData('getBallots');
    displayBallots(ballotData, 'ballotList');
    if(getElement('viewType').value === 'admin'){
        await handleVotesLeftToCast();
    }
}

function displayBallots(ballotData, targetID){
    let ballotsDiv = getElement(targetID);
    ballotsDiv.innerHTML='';
    ballotData.forEach(ballot => {
        let ballotCard = makeBallotForDisplay(ballot);
        ballotsDiv.append(ballotCard);
    });
}

function makeBallotForDisplay(ballot){
    let ballotCard = elementMaker('div', { className: 'alert alert-primary' });
    let ballotID = ballot.ballotID;
    let table = elementMaker('table');
    let tHeadHTML = `<tr aria-colspan="2"><td>Ballot ${ballotID}</td></tr>` +
        `<tr><td>Candidate</td> <td>Votes</td></tr>`;
    let tableHeader = elementMaker('thead', { innerHTML: tHeadHTML });
    table.append(tableHeader);

    let tbody = elementMaker('tbody');
    let idx = 1;
    let results = ballot.results;
    let candidateList = Object.entries(ballot.candidates);
    candidateList.forEach(candidate => {
        let candidateRow = elementMaker('tr');
        let can = candidate[1];
        let result = results[can];
        candidateRow.innerHTML = `<td>${can}</td><td>${result}</td>`;
        tbody.appendChild(candidateRow);
        idx++;
    });
    table.append(tbody);
    ballotCard.append(table);
    return ballotCard;
}

async function handleVotesLeftToCast(){
    let votesLeftToCast = await getData('getVotesLeftToCast');
    let data = votesLeftToCast['votesLeftToCast'];
    let item = getElement('votesLeftToCastInfo');
    if(item){
        let vote = data === 1 ? 'vote remains' : 'votes remain';
        item.innerText = `${data} ${vote} to be cast`;
    } else {
        addVotesLeftToCast(data, 'ballotList');
    }
}

function addVotesLeftToCast(data, targetID){
    let ballotsDiv = getElement('ballotListAlert');
    let vote = data === 1 ? 'vote remains' : 'votes remain';
    let dataCard = elementMaker('div', { className: 'alert alert-info', innerText: `${data} ${vote} to be cast`, id: 'votesLeftToCastInfo' });
    ballotsDiv.appendChild(dataCard);
}

async function ballotsModal(){
    ballotsModalSetup();
    let ballots = await getBallots();
    await addAllBallotsToModal(ballots);
}

//prepares modal for adding all ballot options
function ballotsModalSetup(){
    let content = elementMaker('div', {
        innerText: `Voting as: ${getElement('voterName').value}`,
        style: 'margin-bottom: 20px; cursor: default',
        className: 'btn'
    });
    modalSetup('Ballot Options', content, true);
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}


//wrapper function to add all ballot options
async function addAllBallotsToModal(ballots){
    let voterName = getElement('voterName').value;
    let votedOnBallotIDS = await getVotedOnBallotIDS(voterName);
    ballots.forEach(ballot => {
        if(votedOnBallotIDS === undefined || !votedOnBallotIDS.includes(ballot.ballotID)){
            addSingleBallotToModal(ballot);
        }
    });
}

//adds 1 ballot to the modal
function addSingleBallotToModal(ballot){
    let ballotEntry = elementMaker('div', { className: 'alert alert-primary', onclick: async () => await openSingleBallot(ballot.ballotID) });
    let candidatesList = Object.entries(ballot.candidates);
    let ballotContent = elementMaker('dl');
    let ballotTitle = elementMaker('dt', { innerText: `Ballot ${ballot.ballotID}` });
    ballotContent.appendChild(ballotTitle);
    candidatesList.forEach(candidate => {
        let candidateEntry = elementMaker('dd', { innerText: candidate[1] });
        ballotContent.appendChild(candidateEntry);
    });
    ballotEntry.appendChild(ballotContent);
    addContentToModalBody('modalBody', ballotEntry);
}

//open a ballot for voting
async function openSingleBallot(ballotID, updatingVote = false){
    singleBallotModalSetup(ballotID, updatingVote);
    let ballot = await getSingleBallot(ballotID);
    singleBallotAddCandidates(ballot);
}

//setup modal for showing one ballot to vote on
function singleBallotModalSetupGeneral(ballotID, instructionsText, saveBtnFunc) {
    let instructions = elementMaker('h5', { innerText: instructionsText });
    let content = elementMaker('div', { className: 'col-12',  id: 'candidatesContentDiv' })
    getElement('candidateSelection').value = '';
    getElement('saveBtn').onclick = saveBtnFunc;
    getElement('ballotID').value = ballotID;
    modalSetup(`Ballot ${ballotID}`, instructions);
    addContentToModalBody('modalBody', content);
}

function singleBallotModalSetup(ballotID, updatingVote = false){
    let instructionsText = 'Select 1 candidate to vote for by clicking their name. Cast your vote by hitting the save button.';
    let saveBtnFunc = updatingVote ? updateVote : recordVote;
    singleBallotModalSetupGeneral(ballotID, instructionsText, saveBtnFunc);
}

//add candidates for a single ballot for voting upon
function singleBallotAddCandidates(ballot){
    let candidatesList = Object.entries(ballot.candidates);
    candidatesList.forEach(candidate => {
        let candidateEntry = elementMaker('div', { className: 'row' });
        let candidateEntryData = elementMaker('div', {
            id: candidate[1],
            innerText: candidate[1],
            className: 'btn btn-secondary',
            style: 'margin-bottom: 10px',
            onclick: () => selectCandidateToVoteFor(candidatesList, candidate[1])
        });
        candidateEntry.appendChild(candidateEntryData);
        addContentToModalBody('candidatesContentDiv', candidateEntry);
    });
}

//handles color changing ballot options and setting hidden candidateSelection field
function selectCandidateToVoteFor(candidatesList, candidateSelection){
    candidatesList.forEach(candidate => {
        getElement(candidate[1]).className = 'btn btn-secondary';
    });
    getElement(candidateSelection).className = 'btn btn-primary'
    getElement('candidateSelection').value = candidateSelection;
}


async function newBallot(){
    showModal();
    showLoading();
    newBallotModalSetup();
    await newBallotModal();
    hideLoading();
}

newBallotChoices = [];

function newBallotModalSetup(){
    let instructions = elementMaker('div', { className: 'row' });
    let instructionsText = elementMaker('div', {
        innerText: 'Choose candidates for new ballot',
        className: 'btn',
        style: 'margin-bottom: 20px; cursor: default'
    });
    instructions.appendChild(instructionsText);
    getElement('saveBtn').onclick = makeNewBallot;
    modalSetup('New Ballot', instructions);
    newBallotChoices = [];
}

async function newBallotModal(){
    let data = await getData('getCandidates');
    let col = elementMaker('div', { className: 'col' });
    data.forEach(candidate => {
        let btn = elementMaker('button', {
            id: candidate.name,
            innerText: candidate.name,
            className: 'btn btn-secondary',
            onclick: () => addNewBallotChoice(candidate.name)
        });
        let row = elementMaker('div', {
            className: 'row',
            style: 'width: 90%; margin: auto; margin-top: 5px; margin-bottom: 5px'
        });
        row.append(btn);
        col.append(row);
    });
    addContentToModalBody('modalBody', col);
}

async function deleteBallot(){
    showModal();
    showLoading();
    deleteModalSetup('ballot');
    await deleteBallotModal();
    hideLoading();
}

let allBallotIDS = [];

async function deleteBallotModal(){
    allBallotIDS = await deleteModal('ballot');
}

function deleteBallotFunc(ballotID){
    deleteFunc(ballotID, allBallotIDS, 'ballot');
}

async function deleteBallotBtn(){
    await deleteBtn('ballot', deleteBallotLogic);
}

async function voteOnBallot(){
    let viewType = getElement('viewType').value;
    if(viewType === 'admin'){
        showModal();
        await votersModal();
    } else if(viewType === 'voter'){
        let voterName = getElement('voterName').value;
        let res = await checkIfVoterHasVotedOnAllBallots(voterName);
        if(res){
            getElement('snackbar').innerText = `${voterName} has no ballots to vote on`;
            snackbar();
        } else {
            showModal();
            await openBallotAsVoter(voterName);
        }
    }
}

async function openBallotAsVoter(voterName){
    let res = await checkIfVoterHasVotedOnAllBallots(voterName);
    if(res) {
        getElement('snackbar').innerText = `${voterName} has no ballots to vote on`;
        snackbar();
    } else {
        showModal();
        await ballotsModal();
    }
}