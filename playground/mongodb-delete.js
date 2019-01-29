//const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');
let obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp',{ useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }

    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

   /*  db.collection('Todos').deleteMany({
        text: 'Eat lunch'
    }).then(result => {
		console.log('TCL: result', result)
    }); */

    /* db.collection('Todos').deleteOne({
        text: 'Eat lunch'
    }).then(res => {
		console.log('TCL: res', res)
    }) */

   /*  db.collection('Todos').findOneAndDelete({
        completed: false
    }).then(result => {
		console.log('TCL: result', result)
    }) */

    /* db.collection('Users').deleteMany({
        name: 'Eder'
    }).then(res => {
		console.log('TCL: res', res)
    }) */

    db.collection('Users').findOneAndDelete({
        _id: new ObjectID('5c4f8ed6112394440418b3af')
    }).then(res => {
		console.log('TCL: res', res)
    })

   
    //client.close();
});
