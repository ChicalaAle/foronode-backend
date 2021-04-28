'use strict'

var validator = require('validator');
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

var controller = {


    probando: (req, res) => {
        return res.status(200).send({
            "message": "Prueba"
        });
    },

    save: (req, res) => {
        //Recoger los parametros de la peticion

        var params = req.body;

        //Validar los datos

        var validateName = !validator.isEmpty(params.name);
        var validateSurname = !validator.isEmpty(params.surname);
        var validateEmail = !validator.isEmpty(params.name) && validator.isEmail(params.email);
        var validatePassword = !validator.isEmpty(params.password);

        if(validateName && validateSurname && validateEmail && validatePassword){
            //Crear el objeto de usuario
            var user = new User();

            //Asignar valores al usuario con los datos de la peticion
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = "ROLE_USER";
            user.image = null;

            //Comprobar si el usuario existe

            User.findOne({email: user.email}, (err, isset_user)=> {
                if(err){
                    return res.status(400).send({
                        "message": "Error al comprobar duplicidad del usuario"
                    });
                }

                if(!isset_user){
                    //Si no existe
                    //cifrar contraseña
                    bcrypt.hash(params.password, null, null, (err, hash)=> {
                        user.password = hash;

                        user.save((err, userStored) => {
                            if(err){
                                return res.status(400).send({
                                    "message": "Hubo un error al registrar el usuario"
                                });
                            }

                            if(!userStored){
                                return res.status(400).send({
                                    "message": "No se pudo registrar al usuario"
                                });
                            }

                            return res.status(200).send({
                                "status": "success",
                                "user": userStored
                            });
                        });
                    });
                    
                } else {
                    return res.status(200).send({
                        "message": "El usuario ya está registrado"
                    });
                }

            });

            
        } else {
            return res.status(200).send({
                "message": "Validación de los datos incorrecta, intentelo de nuevo"
            });
        }

        

        //Devolver respuesta

        

    },

    login: (req, res) => {

        // Recoger los parámetros de la peticion

        var params = req.body;

        //Validar los datos

        var validateEmail    = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validatePassword = !validator.isEmpty(params.password);

        if(!validateEmail || !validatePassword){

            return res.status(400).send({
                message: "Error al validar los datos"
            });

        }
        
        //Buscar usuarios que coincidan con el email
        User.findOne({email: params.email.toLowerCase()}, (err, user) => {

            if(err){
                return res.status(500).send({
                    message: "Error al buscar email"
                });
            }

            if(!user){
                return res.status(404).send({
                    message: "No existe el usuario"
                });
            }

            //Si lo encuentra, comprobar su contraseña
            bcrypt.compare(params.password, user.password, (err, check) => {

                if(check){


                    if(params.gettoken){
                        //Generar token de jwt y devolverlo
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }
                    

                    // Limpiar el objeto
                    user.password = undefined;                    

                    // Devolver los datos

                    return res.status(200).send({
                        "status": "success",
                        user
                    });
                } else {
                    return res.status(404).send({
                        "message": "Las credenciales no son correctas"
                    });
                }

                
            });
            
        });        

    },

    update: (req, res) => {

        //Capturar los datos
        var params = req.body;

        //Validar los datos
        try{
            var nameValidated       = !validator.isEmpty(params.name);
            var surnameValidated    = !validator.isEmpty(params.surname);
            var emailValidated      = !validator.isEmpty(params.email) && validator.isEmail(params.email); 
        } catch(err){
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }
        

        delete params.password;

        if(nameValidated && surnameValidated && emailValidated){
            
            if(req.user.email != params.email){
                User.findOne({email: params.email}, (err, exists) => {
                    if(err){
                        return res.status(500).send({                            
                            message: 'No existe el email'
                        });
                    }

                    if(!exists){
                        User.findOneAndUpdate({_id: req.user.sub}, params, {new:true}, (err, updatedUser) => {

                            if(err || !updatedUser){
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'Error al actualizar el usuario'
                                });
                            }
            

                            if(updatedUser){
                                return res.status(200).send({
                                    status: 'success',
                                    updatedUser
                                });
                            }
                            
                        });
                    }

                    if(exists && exists.email == params.email){
                        return res.status(500).send({                            
                            message: 'El email ya existe'
                        });
                    }

                });
            } else {
                User.findOneAndUpdate({_id: req.user.sub}, params, {new:true}, (err, updatedUser) => {

                    if(err || !updatedUser){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al actualizar el usuario'
                        });
                    }
    
                    return res.status(200).send({
                        status: 'success',
                        updatedUser
                    });
                });
            }
                   
            

        } else {
            return res.status(400).send({
                message: "La validación de datos falló"
            });
        }

       
    },

    uploadAvatar: (req, res) => {

        //RECOGER FICHERO 
        var file_name = 'Avatar no subido';

        try{

            var file_path = req.files.file0.path;
            var file_split = file_path.split('\\');
            
            var file_real_name = file_split[2];
    
            var ext_split = file_real_name.split('.');
            var file_ext = ext_split[1];

        }catch(err){
            return res.status(404).send({
                status: "error",
                message: file_name
            });
        }

        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: "error",
                    message: "La extensión del archivo no es válida"
                });
            })
        } else {

            var userId = req.user.sub;

            User.findOneAndUpdate({_id: userId}, {image:file_real_name}, {new:true}, (err, avatarUpdated) => {

                if(err || !avatarUpdated){
                    return res.status(500).send({
                        status: "error",
                        message: "No se ha podido subir la imagen de usuario"
                    });
                } else {
                    return res.status(200).send({
                        status: "success",
                        message: avatarUpdated
                    });
                }

                

            });

            
        }



        
    },

    avatar: (req, res) => {
        var file_name = req.params.fileName;
        var path_file = './uploads/users/' + file_name;

        fs.exists(path_file, (exists) => {
            if(exists){
                return res.sendFile(path.resolve(path_file));
            }else{
                return res.status(404).send({
                    status: "error",
                    message: "La imagen no existe"
                });
            }
        });

    },

    getUsers: (req, res) => {
        User.find().exec((err, users)=>{
            if(err || !users){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay usuarios para mostrar'
                });
            } else {
                return res.status(200).send({
                    status: 'success',
                    users
                });
            }
        });
    },

    getUser: (req, res) => {
        var userId = req.params.id;

        User.findOne({_id: userId}, (err, user) => {
            if(err || !user){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el usuario'
                });
            } else {

                return res.status(200).send({
                    status: 'success',
                    user
                });
            }
        });

    }


};

module.exports = controller;