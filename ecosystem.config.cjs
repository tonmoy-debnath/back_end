// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "foxeka-api",
      script: "./server.js",           // আপনার এন্ট্রি ফাইল
      exec_mode: "cluster",
      instances: "max",                // সব CPU কোর ব্যবহার
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",
      node_args: ["--max-old-space-size=512"],
      env: {
        NODE_ENV: "development",
        PORT: "3000",
        HOST: "0.0.0.0",
        // FRONTEND_URLS: "http://localhost:5173",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
        HOST: "0.0.0.0",
        // FRONTEND_URLS: "https://www.yourdomain.com,https://admin.yourdomain.com",
      },
      // লগ ফাইল
      output: "./logs/out.log",
      error: "./logs/error.log",
      merge_logs: true,
      time: true,
    }
  ]
};
