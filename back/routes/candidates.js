const express = require('express');
const router = express.Router();
const { getAllCandidates, getVotesLeftToCast, getTotalVotesForAllCandidates, createCandidate, deleteCandidate } = require('../controllers/candidatesController');

router.get('/candidates', getAllCandidates);
router.get('/candidatesTotals', getTotalVotesForAllCandidates);
router.post('/newCandidate', createCandidate);
router.delete('/deleteCandidate', deleteCandidate);
router.get('/candidates/ballots', getVotesLeftToCast);

module.exports = router;
