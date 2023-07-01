const db = require('../db')
const {isEmail} = require('validator')
const cuid = require('cuid')
module.exports = {
    create,
    getAll,
    getOne
}

const timeSlots = [];

for (let hour = 9; hour <= 18; hour++) {
  const startTime = hour;
  const endTime = hour + 1;

  timeSlots.push({ start: startTime, end: endTime });
}
const interviewerSchema = new db.Schema({
    _id : {type : String,default : cuid},
    name : {type : String,required : true},
    email : {type : String, required : true},
    type : {type : String,required : true},
    availableSlots : {type : Array,default : timeSlots},
    blockedSlots : {type : Array},
    password : {type : String,required : true},
})

const Interviewer = db.model("Interviewer", interviewerSchema);

async function create(fields) {
    const interviewer = new Interviewer(fields)

    await interviewer.save();

    return interviewer;
}

async function getAll() {
    const data = await Interviewer.find();
    return data;
}

async function getOne(field) {
    const data = await Interviewer.findOne({email : field})
    
    return data;
}
