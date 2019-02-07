const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        let text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({ text }).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => {
					console.log('TCL: err', err)
                    done(err);
                })
            });
    });

    it('Should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({ })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => {
					console.log('TCL: err', err)
                    done(err);
                })
            });
    })
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('Should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get(`/todos/123`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:i', () => {
    it('should remove a todo', done => {
        let hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if(err){
                    return done(err);
                }

                Todo.findById(todos[1]._id).then(todo => {
                    expect(todo).toNotExist();
                    done();
                }).catch(err => done(err));
            });
    });

    it('should return 404 if todo not found', done => {
        request(app)
        .delete(`/todos/${new ObjectID().toHexString()}`)
        .expect(404)
        .end(done());
    });

    it('should return 404 if object id is invalid', done => {
        request(app)
        .delete(`/todos/123`)
        .expect(404)
        .end(done());
    });
});

describe('PATCH /todos/:id', () => {
    it('should update todo', done =>{
        let hexId = todos[1]._id.toHexString();
        let initialText = todos[1].text;

        request(app)
        .patch(`/todos/${hexId}`)
        .send({ text: "eder update", completed: true })
        .expect(200)
        .end((err, res) => {
            if(err){
                return done(err);
            }

            Todo.findById(todos[1]._id).then(todo => {
                expect(todo.completed).toBe(true);
                expect(todo.completedAt).toBeA('number');
                expect(todo.text).toNotBe(initialText);
                done();
            }).catch(err => done(err));

        })
    })

    it('should clear completedAt when todo is not completed', done => {
        let hexId = todos[1]._id.toHexString();
        let initialText = todos[1].text;

        request(app)
        .patch(`/todos/${hexId}`)
        .send({ text: "eder update!", completed: false })
        .expect(200)
        .end((err, res) => {
            if(err){
                return done(err);
            }

            Todo.findById(todos[1]._id).then(todo => {
                expect(todo.completed).toBe(false);
                expect(todo.completedAt).toNotExist();
                expect(todo.text).toNotBe(initialText);
                done();
            }).catch(err => done(err));

        })
    }) 
})
