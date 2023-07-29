const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const api = require("./api");
const middleware = require("./middleware");
const cookieParser = require("cookie-parser");
const cors = require("cors");
app.use(cors());
const auth = require("./auth");
console.log("auth ", auth);
app.use(middleware.cors);

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.post("/login", auth.login);

app.post("/interviewer/create", api.createInterviewer);
app.get("/interviewer/getAll", api.getAllInterviewer);
app.post("/interviewer/getOne", api.getInterviewerByEmail);

app.post("/interviewer/fixInterview", api.fixInterview);
app.post("/interviewer/makeSlotBusy", api.setSlotUnavailable);

app.post("/interviewer/accept", api.acceptInvitation);
app.post("/interviewer/reject", api.rejectInvitation);

app.get("/candidate/getAll/", api.getAllCandidate);
app.post("/candidate/upload", api.uploadCandidates);
app.post("/interviewer/smartfill", api.smartFunction);
app.post("/interviewer/verdict", api.candidateVerdict);

app.use(middleware.handleValidationError);
app.use(middleware.handleError);
app.use(middleware.notFound);

const port = process.env.PORTS || 1337;
app.listen(port);
