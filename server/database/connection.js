const mongoose = require('mongoose');

const connection = () =>{

    mongoose.connect(process.env.DB , {
        useNewUrlParser : true,
        useUnifiedTopology : true
    })
    .then(() =>{console.log('DB Connected')})
    .catch(() =>{console.log('DB Failed')})

}

module.exports = connection