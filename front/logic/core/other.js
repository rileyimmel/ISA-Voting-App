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