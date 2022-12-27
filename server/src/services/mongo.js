const mongoose = require('mongoose');

const MONGO_API = 'mongodb+srv://nasa-ap:N2vjEYZd7IgrcFFM@cluster0.zbwlx68.mongodb.net/nasa?retryWrites=true&w=majority'

mongoose.connection.once('open', () => {
    console.log('Successfully connect to MongoDB');
})

mongoose.connection.on('error', (err) => {
    console.error(err)
})

async function mongoConnect() {
    await mongoose.connect(MONGO_API);
}

async function mongoDisconnect() {
    await mongoose.disconnect()
}

module.exports = {
    mongoConnect,
    mongoDisconnect
}