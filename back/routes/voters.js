const express = require('express');
const router = express.Router();
const { getAllVoters, getVoter, createVoter, deleteVoter, deleteVotersVote, putRecordVote, putUpdatedVote } = require('../controllers/votersController');

router.get('/getAllVoters', getAllVoters);
router.get('/getVoter', getVoter);
router.post('/newVoter', createVoter);
router.put('/recordVote', putRecordVote);
router.put('/updateVote', putUpdatedVote);
router.delete('/deleteVoter', deleteVoter);
router.delete('/deleteVote', deleteVotersVote);

module.exports = router;
