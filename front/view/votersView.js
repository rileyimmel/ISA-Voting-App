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