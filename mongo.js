const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@cluster0.7s5nhnb.mongodb.net/noteApp?retryWrites=true&w=majority`
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})
const Person = mongoose.model('Person', personSchema)

mongoose
    .connect(url)
    .then(_ => {
        if (process.argv.length > 3) {
            const person = new Person({
                name: process.argv[3],
                number: process.argv[4]
            })
            return person.save().then(()=>{
                console.log(`Added ${person.name} number ${person.number} to phone book`)
                return mongoose.connection.close()
            })
        }
        else{
            Person.find({}).then(result =>{
                console.log("Phonebook:")
                result.forEach(person => { console.log(`${person.name} ${person.number}`) })
                mongoose.connection.close()
            })
        }
    })
    .catch(err => console.log(err))

