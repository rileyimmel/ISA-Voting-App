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