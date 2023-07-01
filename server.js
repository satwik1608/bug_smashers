const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const api = require('./api')

const middleware = require('./middleware');
app.use(middleware.cors)

app.use(express.json());
app.use(bodyParser.json());

app.post('/interviewer/create',api.createInterviewer);
app.get('/interviewer/getAll',api.getAllInterviewer);
app.post('/interviewer/getOne',api.getInterviewerByEmail);

app.get('/candidate/getAll',api.getAllCandidate)




app.use(middleware.handleValidationError);
app.use(middleware.handleError);
app.use(middleware.notFound);

const port = process.env.PORTS || 1337;
app.listen(port);
