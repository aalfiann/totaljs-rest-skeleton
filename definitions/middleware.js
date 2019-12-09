// Authenticate api
MIDDLEWARE('auth_api',function($) {
    $.controller.req.headers['x_token'] = ($.controller.req.headers['x_token'] == undefined)?'':$.controller.req.headers['x_token'];
    if($.controller.req.headers['x_token'] == F.config.api_xtoken) {
        $.next();
    } else {
        $.controller.status = 401;
        $.controller.json({code:401,status:'error',message:'You\'re not authorized to use this API!'});
    }
});