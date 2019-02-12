require('./config/config');


const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

let { mongoose } = require('./db/mongoose');
let { Todo } = require('./models/todo');
let { User } = require('./models/user');
let { authenticate } = require('./middleware/authenticate');

let app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    let todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    })

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
		res.status(400).send(err);
    })
});

app.get('/todos', authenticate,(req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({ todos, });
    }, (err) => {
        res.status(400).send(err);
    })
})

//GET /todos/132134
app.get('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id;
    
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOne({
        _id: id,
        _creator: req.user.id
    }).then(todo => {
        todo ? res.send({ todo }) : res.status(404).send();
    }).catch(err => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', authenticate, async (req, res) => {
    const id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    try {
        const todo = await Todo.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        })
        todo ? res.send({ todo }) : res.status(404).send();
    } catch (e) {
        res.status(400).send();
    }
});

app.patch('/todos/:id',authenticate, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }


    Todo.findOneAndUpdate(
        { _id: id, _creator: req.user._id }, 
        { $set: body }, 
        { new: true })
    .then(todo => {
        todo ? res.send({ todo }) : res.status(404).send(404);
    }).catch(err => {
        res.status(400).send();   
    })
});

app.post('/users', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const user = new User(body);
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user)
    } catch (e) {
        res.status(400).send(err);
    }
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
})

app.post('/users/login', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password)
        const token = await user.generateAuthToken()
        res.header('x-auth', token).send(user)
    } catch (e) {
        res.status(400).send();
    }
})

app.delete('/users/me/token', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (e) {
        res.status(400).send();
    }

});

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

module.exports = { app };