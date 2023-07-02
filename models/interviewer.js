const db = require('../db')
const {isEmail} = require('validator')
const cuid = require('cuid')
const Candidate = require('./candidate')
module.exports = {
    create,
    getAll,
    getOne,
    setUnavailable,
    setSlot,
    acceptInvitation,
    rejectInvitation,
    candidateResult
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
    email : emailSchema(),
    type : {type : String,required : true},
    availableSlots : {type : Array,default : timeSlots},
    blockedSlots : {type : Array},
    password : {type : String,required : true},
    interviewSlots: [
      {
        type: Object,
      },
      {
        type: String,
        ref: "Candidate", 
      },],
      notify : {type : Number,default : 0}
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
    const data = await Interviewer.findOne({email : field});

    const slots = data.interviewSlots;
      for(let j = 0;j<slots.length;++j){
        const cId = slots[j].candidateId;
        const candidate = await Candidate.getOne(cId);
        const obj = {
          id : candidate._id,
          name : candidate.name
        }
        console.log(obj)
        data.interviewSlots[j].candidateId = obj;
      }

    await data.save();
    return data;
}

async function setUnavailable(email,timeSlot){
   
    const interviewer = await Interviewer.findOne({email : email});

    interviewer.blockedSlots.push(timeSlot);
  
    
  interviewer.availableSlots = interviewer.availableSlots.filter(i =>(i.start !== timeSlot.start || i.end != timeSlot.end));

    interviewer.interviewSlots = interviewer.interviewSlots.filter(i =>(i.timeSlot.start !== timeSlot.start || i.timeSlot.end != timeSlot.end));

    await interviewer.save();

    return interviewer;
}

async function acceptInvitation(email,timeSlot){
  const interviewer = await Interviewer.findOne({email : email});

  interviewer.notify = interviewer.notify - 1;

  await interviewer.save();
  return interviewer;

}

async function rejectInvitation(email,timeSlot){

  const interviewer = await Interviewer.findOne({email : email});

  let cId;
    for (let i = 0;i<interviewer.interviewSlots.length;++i){
      if(interviewer.interviewSlots[i].timeSlot.start == timeSlot.start && interviewer.interviewSlots[i].timeSlot.end === timeSlot.end){
        cId = interviewer.interviewSlots[i].candidateId;
        break;
      }
    }
    const candidate = await Candidate.getOne(cId);

    candidate.nextInterview = {};

    await candidate.save();

  interviewer.interviewSlots = interviewer.interviewSlots.filter(i => (i.timeSlot.start !== timeSlot.start || i.timeSlot.end !== timeSlot.end));

  interviewer.blockedSlots.push(timeSlot)

             

  interviewer.notify = interviewer.notify - 1;
  await interviewer.save();
  return interviewer;
}



async function setSlot(email,timeSlot,candidateId){

    console.log(email,timeSlot,candidateId);
    const interviewer = await Interviewer.findOne({email : email});


    interviewer.availableSlots = interviewer.availableSlots.filter(i =>(i.start !== timeSlot.start || i.end != timeSlot.end));

    const obj = {
        timeSlot : timeSlot,
        candidateId : candidateId
    }
    interviewer.interviewSlots.push(obj)
    interviewer.notify = interviewer.notify + 1;

    let candidate = await Candidate.getOne(candidateId);

    candidate.nextInterview = timeSlot;

    await candidate.save();
    await interviewer.save();

    return interviewer;
    
}

async function candidateResult(email,timeSlot,verdict){
  const interviewer = await Interviewer.findOne({email : email});


  let cId;
    for (let i = 0;i<interviewer.interviewSlots.length;++i){
      if(interviewer.interviewSlots[i].timeSlot.start == timeSlot.start && interviewer.interviewSlots[i].timeSlot.end === timeSlot.end){
        cId = interviewer.interviewSlots[i].candidateId;
        break;
      }
    }
    const candidate = await Candidate.getOne(cId);
    console.log(candidate)
    candidate.nextInterview = {};
    const interviewType = interviewer.type;
    console.log(interviewType)
    if(verdict === 'pass')
      candidate.status[interviewType] = 1;
    else
      candidate.status[interviewType] = 0;

    await candidate.save();
    await interviewer.save();
    
    return candidate;

}
async function get( email) {
    const interviewer = await Interviewer.findOne({ email: email });
    return interviewer;
  }

async function isUniqueEmail(doc, email) {
    const existing = await get(email);
    return !existing || doc._id === existing._id;
  }
  

function emailSchema(opts = {}) {
    return {
      type: String,
      required: true,
      validate: [
        {
          validator: isEmail,
          message: (props) => `${props.value} is not a valid email address`,
        },
        {
          validator: function (email) {
            return isUniqueEmail(this, email);
          },
          message: (props) => "Email is taken",
        },
      ],
    };
  }
  