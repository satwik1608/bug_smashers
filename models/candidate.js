const db = require("../db");
const cuid = require("cuid");

module.exports = {
  create,
  getOne,
  getAll,
  upload,
};

let defStatus = {
  TECH: 2,
  HR: 2,
  MANAGER: 2,
};
const candidateSchema = new db.Schema({
  _id: { type: String, default: cuid },
  name: { type: String, required: true },
  status: { type: Object, default: defStatus },
  nextInterview: { type: Object, default: {} },
  previousInterview: { type: Number, default: 0 },
});

const Candidate = db.model("Candidate", candidateSchema);

async function create() {
  const names = [
    "Ambika",
    "Rishant",
    "Niraj",
    "Sharad",
    "Tanmay",
    "Anuj",
    "Harsh",
    "Ritik",
    "Pravesh",
    "Ishu",
    "Onkar",
    "Madhur",
    "Sunny",
    "Shubham",
    "Mayur",
    "Mehul",
    "Aakanksh",
    "Rohit",
    "Ayush",
    "Sumit",
    "Gaurav",
    "Nitya",
  ];

  // Generate 60 students with different names
  const status = {
    TECH: 2,
    HR: 2,
    MANAGER: 2,
  };

  for (let i = 0; i < names.length; i++) {
    const name = names[i];

    const obj = {
      name: name,
      status: status,
    };
    const student = new Candidate(obj);
    await student.save();
  }
}

async function getAll(interviewerType, all) {
  let data = await Candidate.find();
  console.log(interviewerType, all);
  if (interviewerType)
    data = data.filter((d) => d.status[interviewerType] === 2);

  if (all) data = data.filter((d) => Object.keys(d.nextInterview).length === 0);
  return data;
}

async function getOne(candidateId) {
  let data = await Candidate.findById(candidateId);

  return data;
}

async function upload(candidates) {
  for (const candidate of candidates.candidates) {
    const status = {
      TECH: 2,
      HR: 2,
      MANAGER: 2,
    };

    const obj = {
      name: candidate.name,
      status: status,
    };

    const c = new Candidate(obj);

    await c.save();
  }
}
