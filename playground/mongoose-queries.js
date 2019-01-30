const { ObjectID } = require('mongodb');
const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('../server/models/user');

let id = '5c50802d18bb1224942d75e0';

/* if (!ObjectID.isValid(id)) {
    console.log('ID not valid')
} */

/* Todo.find({
    _id: id
}).then((todos) => {
	console.log('TCL: todos', todos);
});

Todo.findOne({
    _id: id
}).then((todo) => {
	console.log('TCL: todo', todo);
});
 */
/* Todo.findById(id)
.then(todo => {
    if(!todo){
        return console.log('Id not found!');
    }
	console.log('TCL: todo', todo);
}).catch(err => console.log(err)); */

User.findById(id)
.then(user => {
    if (!user) {
        return console.log('Id not found!');
    }
    console.log('user', user);
}).catch(err => console.log(err));