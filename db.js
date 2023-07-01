const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://satwik:satwik12@cluster0.zzde3x4.mongodb.net/', {
    useNewUrlParser : true,
    useUnifiedTopology : true
})
.then((result) => {
    console.log('Database connected');
}).catch((e) => console.log(e))

module.exports = mongoose