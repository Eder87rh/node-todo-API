let express = require('express');
let bodyParser = require('body-parser');
let { ObjectID } = require('mongodb');

let { mongoose } = require('./db/mongoose');
let { Todo } = require('./models/todo');
let { User } = require('./models/user');

let app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text
    })

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
		res.status(400).send(err);
    })
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({ todos, });
    }, (err) => {
        res.status(400).send(err);
    })
})

//GET /todos/132134
app.get('/todos/:id', (req, res) => {
    let id = req.params.id;
    
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id).then(todo => {
        todo ? res.send({ todo }) : res.status(404).send();
    }).catch(err => {
        res.status(400).send();
    });
});


app.listen(3000, () => {
    console.log('Started on port 3000')
});

module.exports = { app };