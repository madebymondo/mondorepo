export default {
	server: {
		port: 8000,
	},
	templateFilters: {
		filterExtension: addFilterExtensionFilter,
		logEnv: logEnvFilter,
		asyncLogEnv: testAsyncFilter,
	},
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
