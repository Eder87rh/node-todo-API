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

    /* db.collection('Todos').findOneAndUpdate({
        _id: new ObjectID('5c50628f4bca7890e02e9aab')
    }, {
        $set: {
            completed: true
        }
    }, {
        returnOriginal: false
    }).then( res => {
		console.log('TCL: res', res)
    }) */

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5c4f8ee2a1f50e45d0e55eca')
    }, {
        $set: {
            name: 'Eder',
        },
        $inc: {
            age: 1
        }
    }, {
        returnOriginal: false
    }).then(res => {
		console.log('TCL: res', res)
    })
   
    //client.close();
});
