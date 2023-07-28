const db = require("../db");
const { isEmail } = require("validator");
const cuid = require("cuid");
const Candidate = require("./candidate");
module.exports = {
  create,
  getAll,
  getOne,
  get,
  setUnavailable,
  setSlot,
  acceptInvitation,
  rejectInvitation,
  candidateResult,
  recommend,
};

const timeSlots = [];

for (let hour = 9; hour <= 18; hour++) {
  const startTime = hour;
  const endTime = hour + 1;

  timeSlots.push({ start: startTime, end: endTime });
}
const interviewerSchema = new db.Schema({
  _id: { type: String, default: cuid },
  name: { type: String, required: true },
  email: emailSchema(),
  type: { type: String, required: true },
  availableSlots: { type: Array, default: timeSlots },
  blockedSlots: { type: Array },
  password: { type: String, required: true },
  interviewSlots: [
    {
      type: Object,
    },
    {
      type: String,
      ref: "Candidate",
    },
  ],
  notify: { type: Number, default: 0 },
});

const Interviewer = db.model("Interviewer", interviewerSchema);

async function create(fields) {
  const interviewer = new Interviewer(fields);

  await interviewer.save();

  return interviewer;
}

async function getAll() {
  const data = await Interviewer.find();

  return data;
}

async function get(field) {
  console.log(field);
  const data = await Interviewer.findOne({ email: field });

  return data;
}
async function getOne(field) {
  const data = await Interviewer.findOne({ email: field });

  const slots = data.interviewSlots;
  for (let j = 0; j < slots.length; ++j) {
    const cId = slots[j].candidateId;
    const candidate = await Candidate.getOne(cId);
    const obj = {
      id: candidate._id,
      name: candidate.name,
    };
    data.interviewSlots[j].candidateId = obj;
  }

  await data.save();
  return data;
}

async function setUnavailable(email, timeSlot) {
  const interviewer = await Interviewer.findOne({ email: email });

  interviewer.blockedSlots.push(timeSlot);

  interviewer.availableSlots = interviewer.availableSlots.filter(
    (i) => i.start !== timeSlot.start || i.end != timeSlot.end
  );

  interviewer.interviewSlots = interviewer.interviewSlots.filter(
    (i) => i.timeSlot.start !== timeSlot.start || i.timeSlot.end != timeSlot.end
  );

  await interviewer.save();

  return interviewer;
}

async function acceptInvitation(email, timeSlot) {
  const interviewer = await Interviewer.findOne({ email: email });

  interviewer.notify = interviewer.notify - 1;

  await interviewer.save();
  return interviewer;
}

async function rejectInvitation(email, timeSlot) {
  const interviewer = await Interviewer.findOne({ email: email });

  let cId;
  for (let i = 0; i < interviewer.interviewSlots.length; ++i) {
    if (
      interviewer.interviewSlots[i].timeSlot.start == timeSlot.start &&
      interviewer.interviewSlots[i].timeSlot.end === timeSlot.end
    ) {
      cId = interviewer.interviewSlots[i].candidateId;
      break;
    }
  }
  const candidate = await Candidate.getOne(cId);

  candidate.nextInterview = {};

  await candidate.save();

  interviewer.interviewSlots = interviewer.interviewSlots.filter(
    (i) =>
      i.timeSlot.start !== timeSlot.start || i.timeSlot.end !== timeSlot.end
  );

  interviewer.blockedSlots.push(timeSlot);

  interviewer.notify = interviewer.notify - 1;
  await interviewer.save();
  return interviewer;
}

async function setSlot(email, timeSlot, candidateId) {
  console.log(email, timeSlot, candidateId);
  const interviewer = await Interviewer.findOne({ email: email });

  interviewer.availableSlots = interviewer.availableSlots.filter(
    (i) => i.start !== timeSlot.start || i.end != timeSlot.end
  );

  const obj = {
    timeSlot: timeSlot,
    candidateId: candidateId,
  };
  interviewer.interviewSlots.push(obj);
  interviewer.notify = interviewer.notify + 1;

  let candidate = await Candidate.getOne(candidateId);

  candidate.nextInterview = timeSlot;

  await candidate.save();
  await interviewer.save();

  return interviewer;
}

async function candidateResult(email, timeSlot, verdict) {
  const interviewer = await Interviewer.findOne({ email: email });

  let cId;
  for (let i = 0; i < interviewer.interviewSlots.length; ++i) {
    if (
      interviewer.interviewSlots[i].timeSlot.start == timeSlot.start &&
      interviewer.interviewSlots[i].timeSlot.end === timeSlot.end
    ) {
      cId = interviewer.interviewSlots[i].candidateId;
      break;
    }
  }
  const candidate = await Candidate.getOne(cId);
  candidate.nextInterview = {};
  const interviewType = interviewer.type;
  let obj = {
    HR: candidate.status["HR"],
    TECH: candidate.status["TECH"],
    MANAGER: candidate.status["MANAGER"],
  };
  candidate.previousInterview = timeSlot.start;

  if (verdict === "pass") {
    obj[interviewType] = 1;
  } else {
    obj["HR"] = 0;
    obj["TECH"] = 0;
    obj["MANAGER"] = 0;

    interviewer.blockedSlots.push(timeSlot);
  }

  candidate.status = obj;

  await candidate.save();
  await interviewer.save();

  return interviewer;
}

async function recommend(currentTime) {
  // fetching the data and assigning to local database
  let interviewers = await Interviewer.find();

  let candidates = await Candidate.getAll(null, true);

  // sorting the candidates on the basis of  last interview done

  candidates.sort((c1, c2) => c1.previousInterview - c2.previousInterview);

  let interSize = candidates.length;
  let size = interviewers.length;
  let index = 0;
  // Now checking for every candidate and getting him the interviewer
  while (index < interSize) {
    console.log(index);
    let candidate = candidates[index];
    let chosenInterviewer = -1;
    let bestSlot = 100;
    for (let j = 0; j < size; ++j) {
      let interviewer = interviewers[j];

      let interviewerType = interviewer.type;
      // If that candidate has that interview not yet scheduled.
      console.log(interviewer.availableSlots);
      if (
        candidate.status[interviewerType] === 2 &&
        interviewer.availableSlots.length > 0
      ) {
        for (let k = 0; k < interviewer.availableSlots.length; ++k) {
          if (interviewer.availableSlots[k].start >= currentTime) {
            if (bestSlot > interviewer.availableSlots[k].start) {
              bestSlot = interviewer.availableSlots[k].start;
              chosenInterviewer = j;
            }
          }
        }
      }
    }
    if (chosenInterviewer === -1) {
      ++index;
      continue;
    }
    console.log(candidate.name, interviewers[chosenInterviewer].name);
    const chosenSlot = {
      start: bestSlot,
      end: bestSlot + 1,
    };

    // adding time slot to interview slots
    interviewers[chosenInterviewer].interviewSlots.push({
      timeSlot: chosenSlot,
      candidateId: candidate._id,
    });
    interviewers[chosenInterviewer].notify =
      interviewers[chosenInterviewer].notify + 1;
    // removing from available slots
    interviewers[chosenInterviewer].availableSlots = interviewers[
      chosenInterviewer
    ].availableSlots.filter(
      (i) => i.start !== chosenSlot.start || i.end != chosenSlot.end
    );
    console.log(chosenSlot);
    console.log(interviewers[chosenInterviewer].availableSlots);
    // updating the candidates
    candidates[index].nextInterview = chosenSlot;
    ++index;
  }
  console.log("wowo");
  for (const candidate of candidates) {
    await candidate.save();
  }
  for (const interviewer of interviewers) {
    await interviewer.save();
  }

  console.log("gre");
}
async function get(email) {
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
