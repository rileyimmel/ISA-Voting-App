// Contents of front\logic\core\other.js
async function deleteLogic(elementID, endpoint, key){
    let value = getElement(elementID).value;
    try {
        let init = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({[key]: value})
        };
        const response = await sendRequest(endpoint, init);
    } catch (error){
        console.error(error);
    } finally {
        await loadData();
    }
}

function addNewPerson(id, type){
    if(type === "voter"){
        return newPerson("Voter", "newVoter", id);
    } else if(type === "candidate"){
        return newPerson("Candidate", "newCandidate", id);
    }
}

async function newPerson(noun, endPoint, id){
    let targetElement = getElement(id);
    let name = targetElement.value;
    if(name.trim() === ""){
        getElement('snackbar').innerText = `${noun} name cannot be empty`;
        snackbar();
        return;
    }
    const personData = { name: name };
    try {
        let init = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(personData)
        }
        const response = await sendRequest(endPoint, init, false);
        if(response.ok){
            await response.json();
            await loadData();
            getElement('snackbar').innerText = `${noun} successfully added`;
        } else {
            console.error("Failed to add " + noun, response.statusText);
            getElement('snackbar').innerText = `${response.statusText}`;
        }
        snackbar();
    } catch (error) {
        console.error("Error:", error);
        getElement('snackbar').innerText = `An error occurred while adding the ${noun}`;
        snackbar();
    } finally {
        await loadData();
    }
}

function hideModal() {
    let modalElement = getElement('exampleModal');
    let modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) { modalInstance.hide() }
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
}

function showModal(){
    const myModal = new bootstrap.Modal(getElement('exampleModal'));
    myModal.show();
}

// Contents of front\logic\core\requests.js
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

// Contents of front\logic\services\ballotsFE.js
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

// Contents of front\logic\services\candidatesFE.js
async function deleteCandidateLogic(){
    let elementID = 'candidateToDelete';
    let actionURL = 'deleteCandidate';
    let key = 'name';
    await deleteLogic(elementID, actionURL, key);
}

// Contents of front\logic\services\factory.js
function createAlert(alertType) {
    switch (alertType) {
        case 'voters':
            return createVotersAlert();
        case 'candidates':
            return createCandidatesAlert();
        case 'ballots':
            return createBallotsAlert();
    }
}

function createVotersAlert(){
    return createGenericAlert('Voters', 'voterList', [
        { label: 'Add Voter', btnClass: 'btn-primary', onClick: () => addNewPerson('newVoterName', 'voter'), inputID: 'newVoterName', inputPlaceholder: 'New Voter', marginTop: '15px', id: 'addVoterBtn' },
        { label: 'Delete a Voter', btnClass: 'btn-danger', onClick: deleteVoter, marginTop: '15px', id: 'deleteVoterBtn' }
    ]);
}

function createCandidatesAlert(){
    return createGenericAlert('Candidates', 'candidateList', [
        { label: 'Add Candidate', btnClass: 'btn-primary', onClick: () => addNewPerson('newCandidateName', 'candidate'), inputID: 'newCandidateName', inputPlaceholder: 'New Candidate', marginTop: '15px', id: 'addCandidateBtn' },
        { label: 'Delete a Candidate', btnClass: 'btn-danger', onClick: deleteCandidate, marginTop: '15px', id: 'deleteCandidateBtn' }
    ]);
}

function createBallotsAlert(){
    return createGenericAlert('Ballots', 'ballotList', [
        { label: 'Vote on a Ballot', btnClass: 'btn-primary', onClick: voteOnBallot, id: 'voteBallotBtn' },
        { label: 'New Ballot', btnClass: 'btn-primary', onClick: newBallot, marginTop: '15px', id: 'newBallotBtn' },
        { label: 'Delete a Ballot', btnClass: 'btn-danger', onClick: deleteBallot, marginTop: '15px', id: 'deleteBallotBtn' }
    ], 'newBallotChoices');
}

function createGenericAlert(title, listID, buttons, hiddenInputID = null) {
    const alertDiv = elementMaker('div', { className: title === 'Ballots' ? 'alert alert-light' : 'alert alert-dark', style: 'height: 100%', id: `${listID}Alert` });
    const row1 = elementMaker('div', { className: 'row' });
    const mainDiv = elementMaker('div', { id: `${title.toLowerCase()}Alert` });
    const titleElem = elementMaker('h1', { innerText: title });
    const list = elementMaker('div', { id: listID });
    mainDiv.appendChild(titleElem);
    mainDiv.appendChild(list);
    row1.appendChild(mainDiv);
    const row2 = elementMaker('div', { className: 'row' });
    const col = elementMaker('div', { className: 'col', style: title === 'Ballots' ? '34%' : '33%' });
    const innerAlert = elementMaker('div', { className: title === 'Ballots' ? 'alert alert-dark' : 'alert alert-light' });

    buttons.forEach((button) => {
        if (button.inputID) {
            const inputLabel = elementMaker('label', { className: 'form-label', for: button.inputID, innerText: button.inputPlaceholder });
            const inputField = elementMaker('input', { className: 'form-control', type: 'text', name: 'name', id: button.inputID });
            innerAlert.appendChild(inputLabel);
            innerAlert.appendChild(inputField);
        }
        const btnContainer = elementMaker('div', { style: `margin-top: ${button.marginTop ? button.marginTop : ''}` });
        const btn = elementMaker('button', { className: `btn ${button.btnClass}`, type: 'button', innerText: button.label, id: button.id, onclick: button.onClick, style: 'width: 100%' });
        btnContainer.appendChild(btn);
        innerAlert.appendChild(btnContainer);
    });

    if (hiddenInputID) {
        const hiddenInput = elementMaker('input', { hidden: true, id: hiddenInputID });
        innerAlert.appendChild(hiddenInput);
    }
    col.appendChild(innerAlert);
    row2.appendChild(col);
    alertDiv.appendChild(row1);
    alertDiv.appendChild(row2);
    return alertDiv;
}

// Contents of front\logic\services\votersFE.js
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

// Contents of front\view\ballotsView.js
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

// Contents of front\view\candidatesView.js
async function candidates(){
    let candidateData = await getData('getCandidates');
    await displayCandidates(candidateData, 'candidateList');
}

// displays candidates on home page
async function displayCandidates(candidateData, targetID){
    let candidateDiv = getElement(targetID);
    candidateDiv.innerHTML='';

    let candidateAlertDiv = elementMaker('div', { className: 'alert alert-primary'});
    let candidateList = elementMaker('ul');
    let totalVotes = await getData('candidatesTotals');
    candidateData.forEach(candidate => {
        let content = `${candidate.name} - ${totalVotes[candidate.name]} total votes`;
        let li = elementMaker("li", { innerText: content, id: candidate['_id'] });
        candidateList.append(li);
    })
    candidateAlertDiv.append(candidateList);
    candidateDiv.append(candidateAlertDiv);
}

async function deleteCandidate(){
    showModal();
    showLoading();
    deleteModalSetup('candidate');
    await deleteCandidateModal();
    hideLoading();
}

let allCandidateNames = [];

async function deleteCandidateModal(){
    allCandidateNames = await deleteModal('candidate');
}

function deleteCandidateFunc(candidateName){
    deleteFunc(candidateName, allCandidateNames, 'candidate');
}

async function deleteCandidateBtn(){
    await deleteBtn('candidate', deleteCandidateLogic);
}

// Contents of front\view\generalView.js
/* TODO: Modal Methods */

//wrapper for accessing modal; called by html page; allows updating modal behavior sequence w/o changing html page
async function openModal(){
    await votersModal();
}

function modalSetup(titleText, content, btn = false){
    getElement("modalTitle").innerText = titleText;
    let body = getElement("modalBody");
    body.innerHTML = '';
    body.appendChild(content);
    getElement('saveBtn').hidden = btn;
}

function addContentToModalBody(divToAddTo, content){
    getElement(divToAddTo).appendChild(content);
}

/* TODO: Modal Delete Methods */

function deleteModalSetup(noun){
    let instructions = elementMaker('div', { className: 'row' });
    let instructionsText = elementMaker('div', {
        innerText: `Select the ${noun.toUpperCase()} for deleting`,
        className: 'btn',
        style: 'margin-bottom: 20px; cursor: default'
    });
    instructions.appendChild(instructionsText);
    modalSetup(`Delete a ${noun.toUpperCase()}`, instructions);

    let btnFunc;
    switch(noun){
        case 'voter':
            btnFunc = deleteVoterBtn;
            break;
        case 'candidate':
            btnFunc = deleteCandidateBtn;
            break;
        case 'ballot':
            btnFunc = deleteBallotBtn;
            break;
    }
    getElement('saveBtn').onclick = async () => await btnFunc();
}

async function deleteModal(noun) {
    let endPoint, deleteFunc;
    let array = [];
    switch (noun) {
        case 'voter':
            endPoint = 'getVoters';
            deleteFunc = deleteVoterFunc;
            break;
        case 'candidate':
            endPoint = 'getCandidates';
            deleteFunc = deleteCandidateFunc;
            break;
        case 'ballot':
            endPoint = 'getBallots';
            deleteFunc = deleteBallotFunc;
            break;
    }
    let data = await getData(endPoint);
    let col = elementMaker('div', {className: 'col'});
    data.forEach(item => {
        let datum = noun === 'ballot' ? item.ballotID : item.name;
        let text = noun === 'ballot' ? `Ballot ${datum}` : datum;
        array.push(datum);
        let btn = elementMaker('button', {
            id: datum,
            innerText: text,
            className: 'btn btn-secondary',
            onclick: () => deleteFunc(datum)
        });
        let row = elementMaker('div', {
            className: 'row',
            style: 'width: 90%; margin: auto; margin-top: 5px; margin-bottom: 5px'
        });
        row.append(btn);
        col.append(row);
    });
    addContentToModalBody('modalBody', col);
    return array;
}

/* TODO: Other Delete Methods */

function setAllToDeleteToUnSelected(array, noun){
    array.forEach(item => {
        getElement(item).className = 'btn btn-secondary';
        getElement(`${noun}ToDelete`).value = '';
    });
}

function deleteFunc(toDelete, array, noun){
    let itemToDelete = getElement(toDelete);
    if(itemToDelete.className === 'btn btn-secondary'){
        setAllToDeleteToUnSelected(array, noun);
        getElement(toDelete).className = 'btn btn-danger';
        getElement(`${noun}ToDelete`).value = toDelete;
    } else {
        getElement(toDelete).className = 'btn btn-secondary';
        getElement(`${noun}ToDelete`).value = '';
    }
}

async function deleteBtn(noun, deleteLogicFunc){
    let item = getElement(`${noun}ToDelete`).value;
    await deleteLogicFunc();
    getElement('snackbar').innerText = `${item} deleted successfully`;
    snackbar();
    console.log(item + ' deleted successfully');
    hideModal();
}

/* TODO: Misc Methods */

//shorthand for making HTML elements
function elementMaker(tag, attributes = {} ){
    return Object.assign(document.createElement(tag), attributes);
}

//shorthand for getting HTML elements
function getElement(id){
    return document.getElementById(id);
}

//method for loading page
async function loadData(){
    await voters();
    await candidates();
    await ballots();

    if(getElement('viewType').value === 'voter' && getElement('voterName').value !== ''){
        getElement('ballotsAlert').removeChild(getElement('toVoteOnBallotsDiv'));
        getElement('ballotsAlert').removeChild(getElement('votedOnBallotsDiv'));
        await displayVotersBallots(getElement('voterName').value);
    }
}

function showLoading(){
    getElement('loadingDiv').hidden = false;
}

function hideLoading(){
    getElement('loadingDiv').hidden = true;
}

// Contents of front\view\viewSelector.js
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

// Contents of front\view\votersView.js
async function voters(){
    let voterData = await getData('getVoters');
    await displayVoters(voterData, 'voterList');
}

async function displayVoters(voterData, targetID){
    let voterDiv = getElement(targetID);
    voterDiv.innerHTML='';

    let yetToVoteDiv = elementMaker('div', { className: 'alert alert-primary' });
    let doneVotingDiv = elementMaker('div', { className: 'alert alert-secondary' });
    let yetToVoteHeader = elementMaker('h5', { innerText: 'Still Able to Vote' });
    let doneVotingHeader = elementMaker('h5', { innerText: 'Done Voting' });
    let yetToVoteList = elementMaker('ul');
    let doneVotingList = elementMaker('ul');

    for (const voter of voterData) {
        let li = elementMaker("li");
        let span = elementMaker('span', { innerHTML: voter.name, id: voter['_id'] });
        li.append(span);
        let votingStatus = await checkIfVoterHasVotedOnAllBallots(voter.name);
        if(votingStatus){
            doneVotingList.append(li);
        } else {
            yetToVoteList.append(li);
        }
    }
    yetToVoteDiv.append(yetToVoteHeader, yetToVoteList);
    doneVotingDiv.append(doneVotingHeader, doneVotingList);
    voterDiv.append(yetToVoteDiv, doneVotingDiv);
}

async function votersModal(saveFunc = ballotsModal, checkBallots = true, asVoter = false){
    showLoading();
    votersModalSetup();
    let voters = await getVoters();
    await addVotersToModal(voters, checkBallots);
    if(asVoter){
        getElement('saveBtn').onclick = saveFunc;
    } else {
        getElement('saveBtn').onclick = ballotsModal;
    }
    getElement('saveBtn').hidden = false;
    hideLoading();
}


//clear the modal and prepare for voter data
function votersModalSetup(){
    let content = elementMaker('div', { className: 'col-12', id: 'voterContentDiv' });
    let instructions = elementMaker('div', { className: 'row' });
    let instructionsText = elementMaker('div', { innerText: 'Choose registered Voter to vote as', className: 'btn', style: 'margin-bottom: 20px; cursor: default' });
    instructions.appendChild(instructionsText);
    content.appendChild(instructions);
    modalSetup('Registered Voters', content);
}

async function addVotersToModal(voters, checkAllBallots = true) {
    for (const voter of voters) {
        if (!checkAllBallots || !(await checkIfVoterHasVotedOnAllBallots(voter.name))) {
            createAndAppendVoterEntry(voters, voter);
        }
    }
}

function createAndAppendVoterEntry(voters, voter) {
    let voterEntry = elementMaker('div', { className: 'row' });
    let voterEntryData = elementMaker('div', {
        id: voter['name'],
        innerText: voter['name'],
        className: 'btn btn-secondary',
        style: 'margin-bottom: 10px',
        onclick: () => selectCurrentVoter(voters, voter['name'])
    });
    voterEntry.appendChild(voterEntryData);
    addContentToModalBody('voterContentDiv', voterEntry);
}

function selectCurrentVoter(voters, selection){
    getElement('voterName').value = selection;
    voters.forEach(voter => {
        let voterOption = getElement(voter['name']);
        if(voterOption !== null){
            getElement(voter['name']).className = 'btn btn-secondary'
        }
    });
    getElement(selection).className = 'btn btn-primary';
}

async function deleteVoter(){
    showModal();
    showLoading();
    deleteModalSetup('voter');
    await deleteVoterModal();
    hideLoading();
}

let allVoterNames = [];

async function deleteVoterModal(){
    allVoterNames = await deleteModal('voter');
}

function deleteVoterFunc(voterName){
    deleteFunc(voterName, allVoterNames, 'voter');
}

async function deleteVoterBtn(){
    await deleteBtn('voter',  deleteVoterLogic);
}

function snackbar() {
    let snackbar = getElement('snackbar');
    snackbar.className = 'show';
    setTimeout(function(){ snackbar.className = snackbar.className.replace('show', ''); }, 3000);
}

async function displayVotersBallots(voterName){
    let ballotData = await getData('getBallots');
    let endPoint = 'getVoter';
    let query = `?voterName=${voterName}`;
    let voter = await getData(endPoint, query);
    voter = voter[0];
    await displayVotedOnBallots(voter, ballotData);
    await displayToVoteOnBallots(voter, ballotData);
}

async function displayToVoteOnBallots(voter, ballotData){
    let ballotsCastIDS = voter.ballotsVotedOn;
    let t = elementMaker('div', {id: 'toVoteOnBallotsDiv'});
    let tHead = elementMaker('h4', {innerText: 'Ballots You Have Not Voted On'});
    t.appendChild(tHead);
    let count = 0;
    for(const ballot of ballotData){
        if(!ballotsCastIDS.includes(ballot.ballotID)){
            let ballotCard = makeBallotForDisplay(ballot);
            t.appendChild(ballotCard);
            count++;
        }
    }
    if(count === 0){
        let text = elementMaker('p', {innerText: 'You\'ve voted on all ballots'});
        t.appendChild(text);
    }
    let ballotsDiv = getElement('ballotsAlert');
    ballotsDiv.appendChild(t);
}

async function displayVotedOnBallots(voter, ballotData){
    let ballotsCast = voter.ballotsCast;
    let t = elementMaker('div', {id: 'votedOnBallotsDiv'});
    let tHead = elementMaker('h4', {innerText: 'Ballots You Have Cast'});
    t.appendChild(tHead);
    for(const ballot of ballotsCast) {
        let ballotCard = makeBallotForDisplay(findBallot(ballot.ballotID, ballotData));
        let choice = voter.ballotsCast.find(x => x.ballotID === ballot.ballotID).candidate;
        let tr = elementMaker('tr');
        let td = elementMaker('td', {innerText: `Your vote: ${choice}`});
        tr.appendChild(td);
        ballotCard.appendChild(tr);
        t.appendChild(ballotCard);
    }
    let ballotsDiv = getElement('ballotsAlert');
    ballotsDiv.appendChild(t);
}

async function changeVote(){
    let ballotID = getElement('ballotIDToChange').value;
    let votedOnBallotIDS = await getData('getVotedOnBallotIDS', `?voterName=${getElement('voterName').value}`);
    if(votedOnBallotIDS.includes(parseInt(ballotID))){
        await openSingleBallot(ballotID, true);
        showModal();
    }
    getElement('ballotIDToChange').value = '';
}

function findBallot(ballotID, ballots){
    for(const ballot of ballots){
        if(ballot.ballotID === ballotID){
            return ballot;
        }
    }
}

