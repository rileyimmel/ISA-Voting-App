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