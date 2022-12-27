const express = require('express');

const planetsRouter = require('./planets/planets.router');
const launchesRouter = require('./launches/launches.router');

const app = express.Router();

app.use('/planets', planetsRouter);
app.use('/launches', launchesRouter);

module.exports = app;

