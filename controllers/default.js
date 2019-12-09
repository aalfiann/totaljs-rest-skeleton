exports.install = function() {

    ROUTE('/', function(){this.plain('REST Service {0}\nVersion: {1}'.format(CONF.name, CONF.version))});

};