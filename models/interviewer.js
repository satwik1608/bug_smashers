const db = require('../db')
const {isEmail} = require('validator')
const cuid = require('cuid')
module.exports = {
    create,
    getAll,
    getOne,
    setUnavailable,
    setSlot
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
        {type : Object}],
})

const Interviewer = db.model("Interviewer", interviewerSchema);

async function create(fields) {
    const interviewer = new Interviewer(fields)

    await interviewer.save();

    return interviewer;
}

async function getAll() {
    const data = await Interviewer.find().populate();
    return data;
}

async function getOne(field) {
    const data = await Interviewer.findOne({email : field})
    
    return data;
}

async function setUnavailable(email,timeSlot){
    const interviewer = await Interviewer.findOne({email : email});

    interviewer.blockedSlots.push(timeSlot);
    interviewer.availableSlots = interviewer.availableSlots.filter(i =>(i.start !== timeSlot.start || i.end != timeSlot.end));
    interviewer.interviewSlots = interviewer.interviewSlots.filter(i =>(i.timeslot.start !== timeSlot.start || i.timeslot.end != timeSlot.end));
    console.log(interviewer)
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


    await interviewer.save();

    return interviewer;
    
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
  