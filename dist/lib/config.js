const environments = {
    staging: {
        httpPort: 3000,
        httpsPort: 3001,
        name: 'staging',
        passwordSecret: 'password-secret',
    },
    production: {
        httpPort: 5001,
        httpsPort: 5002,
        name: 'prod',
        passwordSecret: 'password-secret',
    },
};
const config = environments[process.env.NODE_ENV] ||
    environments.staging;
export { config };
