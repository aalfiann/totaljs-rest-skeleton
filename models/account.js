const helper = require(F.path.definitions('app_helper'));
const uuidv4 = require('uuid/v4');

NEWSCHEMA('Account').make(function(schema) {
    schema.define('username', 'string');
    schema.define('password', 'string');
    schema.define('email', 'string');

    schema.required('username,password', function(model, op) {
        switch(true) {
            case (op.login == 1):
                return true;
            case (op.register == 1):
                return true;
            default:
                return false;
        }
    });

    schema.required('email', function(model, op) {
        return op.register;
    });

    // Listen schema validation error from totaljs
    helper.schemaErrorBuilder('custom');
    schema.setError((error) => { error.setTransform('custom') });

    schema.addWorkflow('register', function($) {
        var data = $.model.$clean();
        var username = data.username.toString().toLowerCase();

        var nosql = NOSQL('user_data');

        nosql.find().make(function(builder) {
            builder.where('username', username);
            builder.callback(function(err, response, count) {
                if(err) helper.builderErrorResponse($,err);
                if (count) {
                    helper.failResponse($,'Sorry, Username is already exists!')
                } else {
                    helper.cryptPassword(data.password,function(err,hash) {
                        if(err) helper.customResponse($,409,'error','Failed to encrypt password!',err,true);

                        var inputdata = {
                            id:uuidv4(),
                            username:username,
                            hash:hash,
                            email:data.email,
                            date_created:Date.now()
                        };
                        
                        nosql.insert(inputdata).callback(function(err) {
                            if(err) {
                                helper.builderErrorResponse($,err);
                            } else {
                                helper.successResponse($,'Register is successfully!');
                            }
                        });
                    });
                }
            });
        });
    });

    schema.addWorkflow('login', function($) {
        var data = $.model.$clean();
        var nosql = NOSQL('user_data');
        nosql.find().make(function(builder) {
            builder.where('username', data.username.toString().toLowerCase());
            builder.callback(function(err,response,count) {
                if(err) helper.builderErrorResponse($,err);
                if(count) {
                    var user = response[0];
                    helper.comparePassword(data.password,user.hash, function(err,isPasswordMatch){
                        if(err) helper.customResponse($,409,'error','Failed to compare password!',err,true);
                        if(isPasswordMatch) {
                            helper.successResponse($,'Login successful');
                        } else {
                            helper.failResponse($,'Wrong username or password!');
                        }
                    });
                } else {
                    helper.failResponse($,'Wrong username or password!');
                }
            });
        });
    });
    
});