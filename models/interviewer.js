const db = require('../db')
const {isEmail} = require('validator')
const cuid = require('cuid')
module.exports = {
    create,
    getAll,
    getOne,
    setUnavailable
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
    interviewSlots : {type : Array},
    password : {type : String,required : true},
    candidate : {type : String, ref : "Candidate"}
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

async function setUnavailable(email,timeSlot){
    const interviewer = await Interviewer.findOne({email : email});

    interviewer.blockedSlots.push(timeSlot);
    if(interviewer.availableSlots.find(timeSlot) !== undefined)
        interviewer.availableSlots.remove(timeSlot);
    if(interviewer.interviewSlotsSlots.find(timeSlot) !== undefined)
        interviewer.interviewSlots.remove(timeSlot);

    await interviewer.save();

    return interviewer;
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
  