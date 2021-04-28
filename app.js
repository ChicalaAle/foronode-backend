'use strict'

// Requires
var express = require('express');
var bodyParser = require('body-parser');


//Ejecutar express

var app = express();

// Cargar archivos de rutas

var userRoutes = require('./routes/user');
var topicRoutes = require('./routes/topic');
var commentRoutes = require('./routes/comment');

// Middlewares

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// Reescribir rutas

app.use('/api', userRoutes);
app.use('/api', topicRoutes);
app.use('/api', commentRoutes);

// exportar módulo
module.exports = app;