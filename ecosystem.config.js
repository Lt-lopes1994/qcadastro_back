module.exports = {
  apps: [
    {
      name: 'webhook-server',
      script: 'webhooks/webhook-server.ts',
      interpreter: './node_modules/.bin/ts-node',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};