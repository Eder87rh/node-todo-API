const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
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
    });

    describe('GET /users/me', () => {
        it('should return user if authenticated', (done) => {
            request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
        });

        it('return 401 if not authenticated', (done) => {
            request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
        })
    });

    describe('POST /users', () => {
        it('should create a user', done => {
            let email = 'example@example.com';
            let password = '123mnb!';

            request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({ email }).then(user => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch(err => done(err));
            });
        });

        it('should return validation errors if request invalid', done => {
            request(app)
            .post('/users')
            .send({
                email: 'and',
                password: '123'
            })
            .end(done);
        });

        it('should not create user if email in use', done => {
            request(app)
            .post('/users')
            .send({
                email: users[0].email,
                password: 'Password123!'
            })
            .expect(400)
            .end(done);
        });
    });

    describe('POST /users/login', () => {
        it('should login user and return auth token', done => {
            request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then(user => {
                    expect(user.tokens[0]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch(err => done(err));
            })
        })

        it('should reject invalid login', done => {
            request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: 'wrongPassword'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then(user => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(err => done(err));
            })
        })
    });

    describe('DELETE /users/me/token', () => {
        it('should remove auth token on logout', done => {
            request(app)
            .delete('/users/me/token')
            .set("x-auth", users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(err => done(err));
            })
        });

        /* it('', done => {

        }); */
    });


})
