const Interviewer = require('./models/interviewer')

module.exports = {
    createInterviewer,
    getAllInterviewer,
    getInterviewerByEmail
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






