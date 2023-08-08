export default {
	renderMode: 'server',
	server: {
		port: 3000,
		serverHook: (app, engine) => {
			app.use('*', (req, res, next) => {
				console.log('This is a global server midleware');
				console.log(engine._renderTemplate);
				next();
			});
		},
	},
	templateFilters: {
		filterExtension: addFilterExtensionFilter,
		logEnv: logEnvFilter,
		asyncLogEnv: testAsyncFilter,
	},
	// Directories to passthrough to build relative to root
	passthrough: ['cms'],
};

function addFilterExtensionFilter(value) {
	return `${value} was passed to the filter`;
}

function logEnvFilter(env) {
	console.log('Env Filter', env);
}

async function testAsyncFilter(env) {
	console.log('Async env filter');
}
