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