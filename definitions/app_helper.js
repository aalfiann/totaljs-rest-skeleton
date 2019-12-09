'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
    schemaErrorBuilder,
    builderErrorResponse,
    successResponse,
    failResponse,
    customResponse,
    cryptPassword,
    comparePassword
}

/**
 * Modify error from schema
 * @param {string} name     this is the error key name 
 */
function schemaErrorBuilder(name){
    return ErrorBuilder.addTransform(name, function(isResponse) {
        var builder = [];
    
        for (var i = 0, length = this.items.length; i < length; i++) {
            var err = this.items[i];
            builder.push({name:err.name,error:err.error});
        }
    
        if (isResponse) {
            this.status = 400;
            if (builder.length > 0){
                return JSON.stringify({
                    code:this.status,
                    status:'error',
                    message:'Invalid parameter',
                    error:builder
                });
            } else {
                this.status = 500;
                return JSON.stringify({
                    code:this.status,
                    status:'error',
                    message:'Something went wrong...'
                });
            }
        }
        return builder;
    });
}

/**
 * Database builder error response
 * @param {controller} $        this is the totaljs controller
 * @return {callback}
 */
function builderErrorResponse($,err){
    $.controller.status = 409;
    $.callback(JSON.parse(JSON.stringify({
        code:409,
        status:'error',
        message:'Something went wrong...',
        error:err
    })));
}

/**
 * Response success 
 * @param {controller} $        this is the totaljs controller
 * @param {string} message      this is the message of response
 * @param {*} response          this is the response detail
 * @return {callback}
 */
function successResponse ($,message, response=[]) {
    $.controller.status = 200;
    var success = {
        'code':200,
        'status':'success',
        'message':message,
        'response':response
    }
    $.callback(JSON.parse(JSON.stringify(success)));
}

/**
 * Response fail 
 * @param {controller} $        this is the totaljs controller
 * @param {string} message      this is the message of response
 * @param {*} response          this is the response detail
 * @return {callback}
 */
function failResponse ($, message, response=[]) {
    $.controller.status = 200;
    var fail = {
        'code':200,
        'status':'error',
        'message':message,
        'response':response
    }
    $.callback(JSON.parse(JSON.stringify(fail)));
}

/**
 * Response custom 
 * @param {controller} $        this is the totaljs controller
 * @param {int} code            this is the http code you want to sent in response header
 * @param {string} status       this is the status you want to sent in response body
 * @param {string} message      this is the message of response
 * @param {*} response          this is the response detail
 * @param {bool} isError        this is the type of success or error response
 * @return {callback}
 */
function customResponse ($, code, status, message, response=[], isError=false) {
    $.controller.status = code;
    var custom = {
        'code':code,
        'status':status,
        'message':message
    }
    if(response !== undefined && response !== null) {
        var name = undefined;
        if(isError) {
            name = 'error';
        } else {
            name = 'response';
        }
        custom[name] = response;
    }
    $.callback(JSON.parse(JSON.stringify(custom)));
}

/**
 * Encrypt password
 * @param {string} password     this is the user password 
 * @param {*} callback
 * @return {callback} 
 */
function cryptPassword(password, callback) {
    bcrypt.genSalt(10, function(err, salt) {
     if (err) 
       return callback(err);
 
     bcrypt.hash(password, salt, function(err, hash) {
       return callback(err, hash);
     });
   });
 };
 
 /**
  * Compare password
  * @param {string} plainPass        this is the user password 
  * @param {string} hashword         this is the hashed user password
  * @param {*} callback 
  * @return {callback}
  */
 function comparePassword(plainPass, hashword, callback) {
    bcrypt.compare(plainPass, hashword, function(err, isPasswordMatch) {   
        return err == null ?
            callback(null, isPasswordMatch) :
            callback(err);
    });
 };