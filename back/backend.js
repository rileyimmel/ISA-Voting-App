const express = require('express');
const backend = express();
const port = 3002;

const votersRoutes = require('./routes/voters');
const ballotsRoutes = require('./routes/ballots');
const candidatesRoutes = require('./routes/candidates');

backend.use(express.json());

// Register routes
backend.use('/', votersRoutes);
backend.use('/', ballotsRoutes);
backend.use('/', candidatesRoutes);

backend.listen(port, () => console.log(`Listening on port ${port}`));
