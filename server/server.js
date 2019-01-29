let mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true });

let Todo = mongoose.model('Todo', {
    text: {
        type: String,
        require: true,
        minlength: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    }
});

let User = mongoose.model('User', {
    email: {
        type: String,
        require: true,
        trim: true,
        minlength: 1
    }
})

let user = new User({
    email: 'eder .ramirez87@gmail.com'
})

user.save().then(doc => {
	console.log('TCL: doc', doc)
}, (err) => {
	console.log('TCL: err', err)
})

/* let newTodo = new Todo({
    text: 'Cook dinner',
})

newTodo.save().then((doc) => {
    console.log('TCL: daved todo doc', doc);
}, (e) => {
	console.log('TCL: unable to save todo', e);
}); */

/* let otherTodo = new Todo({
    text: 23
});

otherTodo.save().then(doc => {
	console.log('TCL: doc', doc)
}, (e) => {
	console.log('TCL: e', e)
}); */

