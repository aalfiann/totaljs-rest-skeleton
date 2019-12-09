exports.install = function() {

    // Sets cors for the entire API
	CORS();

    // Account
    ROUTE('/api/account/register', ['post','*Account --> @register','#auth_api']);
    ROUTE('/api/account/login', ['post','*Account --> @login','#auth_api']);
    
}