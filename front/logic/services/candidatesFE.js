async function deleteCandidateLogic(){
    let elementID = 'candidateToDelete';
    let actionURL = 'deleteCandidate';
    let key = 'name';
    await deleteLogic(elementID, actionURL, key);
}