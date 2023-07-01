const Interviewer = require('./models/interviewer')
const Candidate = require('./models/candidate')
module.exports = {
    createInterviewer,
    getAllInterviewer,
    getInterviewerByEmail,
    getAllCandidate,
    fixInterview,
    setSlotUnavailable
}

async function createInterviewer(req,res){
    try{
        const data = await Interviewer.create(req.body);

        res.status(200).json(data);
    }
    catch(err) {
        res.json(err)
    }
    
}
async function getAllInterviewer(req,res){
    try{
        const data =  await Interviewer.getAll();
        res.status(200).json(data);
    }
    catch (err){
        res.json(err)
    }
}

async function getInterviewerByEmail(req,res){
    try{
        const { email } = req.body;
        const data = await Interviewer.getOne(email);
        res.status(200).json(data);
    }
    catch(err){
        res.json(err);
    }
}

async function getAllCandidate(req,res){
    try {
        const data = await Candidate.getAll();
        res.json(data);
    }
    catch(err) {
        res.json(err);
    }
}

async function fixInterview(req,res){
    try {   
        const {email,timeSlot,candidateId} = req.body;
        const data = await Interviewer.setSlot(email,timeSlot,candidateId);
        res.json(data);
    }
    catch(err){
        res.json(err);
    }
}

async function setSlotUnavailable(req,res){
    try{
        const {email,timeSlot} = req.body;
        console.log(email)

        const data = await Interviewer.setUnavailable(email,timeSlot);

        res.json(data);
    }
    catch (err){
        res.json(err);
    }
}




