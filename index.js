const express = require('express');
const Client = require('node-rest-client').Client;
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');
const debug = require('debug')('app:startup'); //can have any name in the namespace and also set multiple debug nmaespaces

const logging = require('./logging');
const Joi = require('joi');
const client = new Client();

const app = express();

app.use(helmet());

debug(`Application Name: ${config.get('name')}`);
debug(`Email Host: ${config.get('email.host')}`);
debug(`Email Password: ${config.get('email.password')}`);


if(app.get('env') === 'development') {
    app.use(morgan('tiny'));
    debug("Morgan Started...");
}

app.use(express.json());
app.use(express.urlencoded());

app.use(logging);

const courses = [
    {id:1, name: 'Course1'},
    {id:2, name: 'Course2'},
    {id:3, name: 'Course3'},
]
app.get('/', (req, res) => {
    res.send({text: 'Hellow World!!'});
});

app.get('/api/courses', (req, res) => {
    res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));

    if(!course) return res.status(404).send(`Course not found for id: ${req.params.id}`);
    res.send(course);
});

app.post('/api/courses', (req, res) => {
    let { error } = validateCourse(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const course = {
        id: courses.length + 1,
        name: req.body.name
    };

    courses.push(course);
    res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send({error: `No course found with id: ${req.params.id}`});
    
    let { error } = validateCourse(req.body);

    if(error) return res.status(400).send(error.details[0].message);
    course.name = req.body.name;
    res.send(course);
    
});

app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send({error: `No course found with id: ${req.params.id}`});

    const index = courses.indexOf(course);
    courses.splice(index, 1);
    
    res.send(course);
});

let validateCourse = course => {
    const schema = {
        name: Joi.string().min(3).required()
    }

   return Joi.validate(course, schema);
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});