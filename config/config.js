module.exports = {
	'server_url': "localhost:1805",
	'base_url'	: "/api",
	'secret' 	: "jpxwebadmin",

	// ---DB DEVELOPMENT---
	// 'db_host_dev' : "10.130.64.126",
	// 'db_user_dev' : "jpxweb",
	// 'db_password_dev' : "Jpx@2018",
	/*'db_host_dev' : "jpx-admin-dev.cytnryopdw9b.ap-southeast-1.rds.amazonaws.com",
	'db_user_dev' : "jpxweb",
	'db_password_dev' : "Jpx@2018",*/

	// ---DB LOCAL---
	// 'db_host_dev' : "127.0.0.1",
	'db_host_dev' : "localhost",
	'db_user_dev' : "root",
	'db_password_dev' : "12345678",

	// ---DB STAGING---
	// 'db_host_staging' : "209.97.170.130",
	// 'db_user_staging' : "jpxweb",
	// 'db_password_staging' : "Kolour2019!",

	// ---DB PRODUCTION---
	// 'db_host_prod' : "159.65.1.147",
	// 'db_user_prod' : "jpxweb",
	// 'db_password_prod' : "Agan@17Dec2018",
	
	'default_password': '123456',
	'salt_key' : 'JpxA$@|7K3y',
	'redis_ws' : {
		/*redis va bni (dev-bni-va)*/
		'base_url' : "http://206.189.148.31:20194/v.0.1",
		//'base_url' : "http://10.130.64.86:20194/v.0.1",
		//'base_url' : "http://localhost:2016/v.0.1",
		//'base_url' : "http://13.228.156.226:2016/v.0.1",
		//'base_url' : "http://209.97.172.24:20194/v.0.1",
		'create_va': '/createva/',
		'update_va': '/updateva/'
	},
	'bni_va' : {
		/*client id dev*/
		'client_id': "541",
		/*client id prod*/
		//'client_id': "922"  
	},
	'smtp2go': {
		'url' : 'https://api.smtp2go.com/v3/email/send',
		'api_key' : 'api-2BE18FCC286A11E9B1BDF23C91C88F4E'
	},
	'aws' : {
		// dev bucket
		// 'bucket' : 'jpx-whitelabel-dev',
		// 'accessKeyId' : 'AKIAJAYO33BFBBCAGIHA',
		// 'secretAccessKey' : "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",
		// dev staging
		'bucket' : 'jpx-whitelabel',
		'accessKeyId' : 'AKIAJAYO33BFBBCAGIHA',
		'secretAccessKey' : "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",
		// production bucket
		// 'bucket' : '',
		// 'accessKeyId' : '',
		// 'secretAccessKey' : "",
	},
	'dashboard_url' : 'http://128.199.127.112:3003'
}