'use strict'

var Topic = require('../models/topic');
var validator = require('validator');

var commentController = {

    add: (req,res) => {

        //Recoger el id del topic de la url

        var topicId = req.params.topicId;

        //find por id del topic

        Topic.findById({_id: topicId}, (err, topic) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'No se pudo encontrar el tema'
                });
            }

            if(req.body.content){

                try{

                    var validate_content = !validator.isEmpty(req.body.content);       
        
                }catch(err){
                    return res.status(400).send({
                        status: 'error',
                        message: 'No se pudo validar el contenido'
                    });
                }

                if(validate_content){
                    var comment = {
                        user: req.user.sub,
                        content: req.body.content
                    };
    
                    topic.comments.push(comment);
    
                    topic.save((err) => {
    
                        if(err){
                            return res.status(500).send({
                                status: 'error',
                                message: 'Hubo un error al guardar el comentario'
                            });
                        }
    
                        return res.status(200).send({
                            status: 'success',
                            topic
                        });
    
    
                    });
                }

                

            }

                //en la propiedad comments del objeto resultante hacer un push

                //guardar el topic completo

                //devolver respuesta
                       

        });

        
        

    },

    update: (req,res) => {

        var commentId = req.params.commentId;

        var params = req.body;

        try{

            var validate_content = !validator.isEmpty(params.content);       

        }catch(err){
            return res.status(400).send({
                status: 'error',
                message: 'No se pudo validar el contenido'
            });
        }

        if(validate_content){

            Topic.findOneAndUpdate(

                {"comments._id": commentId, "comments.user": req.user.sub},
                {
                    "$set": {
                        "comments.$.content": params.content
                    }
                },
                {new:true},
                (err, commentUpdated) => {

                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: 'No se pudo actualizar el comentario'
                        });
                    }

                    if(!commentUpdated){
                        return res.status(404).send({
                            status: 'error',
                            message: 'No existe el comentario'
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        topic: commentUpdated
                    });

                }

            );

        }


    },

    delete: (req,res) => {

        // SACAR EL ID DEL TOPIC Y DEL COMENTARIO A BORRAR

        var topicId = req.params.topicId;
        var commentId = req.params.commentId;

        // BUSCAR EL TOPIC 

        Topic.findById(topicId, (err, topic) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Ocurrió un error al buscar el tema'
                });
            }

            if(!topic){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el tema'
                });
            }


            // SELECCIONAR EL SUBDOCUMENTO (comentario)

            var comment = topic.comments.id(commentId);

            // BORRAR EL COMENTARIO
            if(comment){

                comment.remove();
                // GUARDAR EL TOPIC
                topic.save((err, saved) => {
                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Ocurrió un error al borrar el comentario'
                        });
                    }

                    return res.status(200).send({
                        topic
                    });

                });
                // DEVOLVER RESULTADO

                

            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el comentario'
                });
            }

           
        });

        

    }

}

module.exports = commentController;