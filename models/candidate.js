const db = require('../db');
const cuid = require('cuid')

module.exports = {
    create,
    getOne,
    getAll,
    upload
}

let defStatus = {
    "TECH" : 2,
    "HR" : 2,
    "MANAGER": 2
}
const candidateSchema = new db.Schema({
    _id: {type : String,default: cuid},
    name : {type : String,required:true},
    status : {type : Object , default : defStatus},
    nextInterview : {type : Object,default : {}},
    previousInterview:  {type : Number,default : 0}
})

const Candidate = db.model("Candidate",candidateSchema);

async function create(){
  
    function generateRandomName() {
        const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack',
                       'Katherine', 'Leo', 'Mia', 'Noah', 'Olivia', 'Patrick', 'Quinn', 'Ruby', 'Samuel', 'Tara',
                       'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zachary', 'Abigail', 'Benjamin', 'Chloe', 'Daniel',
                       'Emily', 'Fiona', 'George', 'Hannah', 'Isaac', 'Julia', 'Kevin', 'Lily', 'Matthew', 'Nora',
                       'Oscar', 'Penelope', 'Quincy', 'Rachel', 'Simon', 'Sophia', 'Thomas', 'Ursula', 'Violet',
                       'William', 'Xena', 'Yasmine', 'Zoe'];
      
        const randomIndex = Math.floor(Math.random() * names.length);
        const name = names.splice(randomIndex, 1)[0]; // Remove the selected name from the array
        return name;
      }
      
      // Generate 60 students with different names
      const status = {
        TECH: 2,
        HR: 2,
        MANAGER: 2,
      };
      
      for (let i = 0; i < 60; i++) {
        const name = generateRandomName();

        const obj = {
          name : name,
          status : status,
        }
        const student =  new Candidate(obj);
        await student.save();
    
      }
}

async function getAll(interviewerType,all){


    let data = await Candidate.find();
    console.log(interviewerType,all)
    if(interviewerType)
      data = data.filter(d => (d.status[interviewerType] === 2));
    
    if(all)
      data = data.filter(d => (Object.keys(d.nextInterview).length === 0));
    return data;
}

async function getOne(candidateId){
  let data = await Candidate.findById(candidateId);

  return data;
}

async function upload(candidates){

  for(const candidate of candidates){
    const c = new Candidate(candidate);

    await c.save();
  }


}