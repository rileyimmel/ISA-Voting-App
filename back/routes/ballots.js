const express = require('express');
const router = express.Router();
const { getAllBallots, getBallot, getAllBallotIDS, getVotedOnAllBallots, getVotedOnBallotIDS, createBallot, deleteBallot } = require('../controllers/ballotsController');
const {deleteVoter} = require("../controllers/votersController");

router.get('/ballots', getAllBallots);
router.get('/ballot', getBallot);
router.get('/allBallotIDS', getAllBallotIDS);
router.get('/votedOnAllBallots', getVotedOnAllBallots);
router.get('/votedOnBallotIDS', getVotedOnBallotIDS);
router.post('/newBallot', createBallot);
router.delete('/deleteBallot', deleteBallot);

module.exports = router;
