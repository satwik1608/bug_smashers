const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const api = require('./api')

app.use(express.json());
app.use(bodyParser.json());

app.get('/interviewer/create',api.createInterviewer);
app.get('/interviewer/getAll',api.getAllInterviewer);
app.post('/interviewer/getOne',api.getInterviewerByEmail);


const port = process.env.PORTS || 1337;
app.listen(port);
