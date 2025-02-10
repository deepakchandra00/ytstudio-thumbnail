const os = require('os');

// Custom system metrics
const getSystemMetrics = () => ({
  cpu: {
    usage: process.cpuUsage(),
    loadAvg: os.loadavg(),
    cores: os.cpus().length
  },
  memory: {
    total: os.totalmem(),
    free: os.freemem(),
    used: os.totalmem() - os.freemem()
  },
  uptime: process.uptime()
});

module.exports = {
  getSystemMetrics
};