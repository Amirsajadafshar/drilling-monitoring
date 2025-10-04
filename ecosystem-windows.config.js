module.exports = {
  apps: [{
    name: 'oil-monitoring-system',
    script: 'server.ts',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    interpreter: 'tsx',
    interpreter_args: '',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    windows_hide: false,
    min_uptime: '10s',
    max_restarts: 5,
    restart_delay: 4000
  }]
}