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

    /* db.collection('Todos').find({
      _id: new ObjectID('5c4f86ba0d423531706c6aff')
    }).toArray()
    .then((docs) => {
		  console.log('TCL: Todos', JSON.stringify(docs, undefined, 2));
        
    }).catch(err => {
		  console.log('TCL: err', err) 
    }); */

    /* db.collection('Todos').find().count()
    .then((count) => {
			console.log('TCL: count', count)
    }).catch(err => {
		  console.log('TCL: err', err) 
    }); */

    db.collection('Users').find({ name: 'Mike' }).toArray()
      .then(docs => {
				console.log('TCL: docs', JSON.stringify(docs, undefined, 2));
        
      })
      .catch(err => {
				console.log('TCL: err', err)
        
      });
   
    //client.close();
});
