module.exports = {
  apps: [
    {
      name: "bridge_connections backend",

      script: "./dist/server.js",

      watch: false,

      env: {
        NODE_ENV: "production",
      },
    },

    {
      name: "bridge_connections_emailworker",

      script: "./dist/jobs/workers/emailWorker.js",

      watch: false,

      env: {
        NODE_ENV: "production",
      },
    },

    {
      name: "bridge_connections_notifications_worker",

      script: "./dist/jobs/workers/notificationWorker.js",

      watch: false,

      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
