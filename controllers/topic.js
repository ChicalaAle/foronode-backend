'use strict'

var validator = require('validator');
var Topic = require('../models/topic');
const user = require('../models/user');

var controller = {

    test: (req,res)=>{
        return res.status(200).send({
            message: "Hola"
        });
    },

    save: (req,res)=>{

        var params = req.body;

        try{

            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);            

        }catch(err){
            return res.status(500).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
        }

        if(validate_title && validate_content && validate_lang){

            var topic = new Topic();

            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;
            // Guardar el topic

            topic.save((err, topicStored) => {
                if(err || !topicStored){
                    return res.status(500).send({
                        status: 'error',
                        message: 'El tema no se ha guardado'
                    });
                } else {
                    return res.status(500).send({
                        status: 'success',
                        topic: topicStored
                    });
                }
            });

        } else {
            return res.status(500).send({
                status: 'error',
                message: 'Los datos no son válidos'
            });
        }

       
    },

    getTopics: (req,res) => {

        //CARGAR LA LIBRERÍA DE PAGINACIÓN EN LA CLASE (MODELO)


        //RECOGER LA PÁGINA ACTUAL


        var page;

        if(!req.params.page || req.params.page == null || req.params.page == undefined || req.params.page == 0 || req.params.page == "0"){
            page = 1;
        } else {
            page = parseInt(req.params.page);
        }

        //INDICAR LAS OPCIONES DE PAGINACIÓN

        var options = {
            sort: {date: -1},
            populate: 'user',
            limit: 5,
            page: page
        };

        //FIND PAGINADO
        Topic.paginate({}, options, (err, topics) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al hacer la consulta'
                });
            }

            if(!topics){
                return res.status(404).send({
                    status: 'notfound',
                    message: 'No hay temas para mostrar'
                });
            }
            
            if(topics){
                return res.status(200).send({
                    status: 'success',
                    topics: topics.docs,
                    totalDocs: topics.totalDocs,
                    totalPages: topics.totalPages
                });
            }

            
        });

        //DEVOLVER RESULTADO (topics, total de topics, total de páginas)

        
    },

    getTopicsByUser: (req,res) => {

        //SACAR ID DEL USUARIO QUE SE QUIERE VER LOS TOPICS

        var userId = req.params.user;

        // MOSTRAR LOS TOPICS DEL USUARIO

        Topic.find({user: userId}, (err, topics) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Hubo un error al cargar los temas del usuario'
                });
            }

            if(!topics){
                return res.status(404).send({
                    status: 'success',
                    message: 'No hay temas que mostrar'
                });
            }

            if(topics){
                return res.status(200).send({
                    status: 'success',
                    topics
                });
            }

            
        }) 
        .sort([['date', 'descending']]);

        //DEVOLVER MENSAJE



        
    },

    getTopic: (req, res) => {
        
        var topicId = req.params.id;

        Topic.findOne({_id: topicId}, (err, topic) => {

            if(err || !topic){
                return res.status(404).send({
                    status: 'error',
                    message: 'No se pudo encontrar el tema.'
                });
            } else {
                return res.status(200).send({
                    status: 'success',
                    topic
                });
            }



        }).populate('user');

    },

    update: (req, res) => {

        var topicId = req.params.id;

        var params = req.body;

        //Validar los datos
        try{
            var titleValidated       = !validator.isEmpty(params.title);
            var contentValidated    = !validator.isEmpty(params.content);
            var langValidated      = !validator.isEmpty(params.lang); 
        } catch(err){
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }

        var update = {
            title: params.title,
            content: params.content,
            code: params.code,
            lang: params.lang
        };

        if(titleValidated && contentValidated && langValidated){

            Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new:true}, (err, topicUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Ocurrió un error al buscar el tema'
                    });
                }

                if(!topicUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el tema'
                    });

                }

                if(topicUpdated){
                    return res.status(200).send({
                        status: 'success',
                        topicUpdated
                    });
                }

            });

        }
    },

    delete: (req, res) => {

        var topicId = req.params.id;

        Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, topicDeleted) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Hubo un error al eliminar el tema'
                });
            }

            if(!topicDeleted){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el tema'
                });
            }

            if(topicDeleted){
                return res.status(200).send({
                    status: 'success',
                    topicDeleted
                });
            }

        });
       
    },

    search: async (req, res) => {


        // Sacar string a buscar de la url

        var searchString = req.params.search;
            // Find OR 

        var topics = await Topic.find({
            "$or": [
                {"title": {"$regex": searchString, "$options": "i"} },
                {"content": {"$regex": searchString, "$options": "i"} },
                {"lang": {"$regex": searchString, "$options": "i"} },
                {"code": {"$regex": searchString, "$options": "i"} },
                
            ]
        })
        .sort([['date', 'descending']])
        .populate('user')
        .exec();

        return res.status(200).send({
            status: 'success',
            search: topics
        });


            /*Topic.find({
                "$or": [
                    {"title": {"$regex": searchString, "$options": "i"} },
                    {"content": {"$regex": searchString, "$options": "i"} },
                    {"lang": {"$regex": searchString, "$options": "i"} },
                    {"code": {"$regex": searchString, "$options": "i"} },
                ]
            })
            .sort([['date', 'descending']])
            //.populate("user")
            .exec((err, topic) => {

                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Hubo un error al buscar'
                    });
                }

                if(!topic){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No hay temas disponibles'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    search: topic
                });
            });       */
        
    }

}

module.exports = controller;