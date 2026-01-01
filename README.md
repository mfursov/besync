# BeSync - File Synchronization Utility over SSH

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

BeSync is a simple yet powerful TypeScript utility for synchronizing files and folders between multiple machines using SSH and `rsync`. It's designed to keep your important configuration files consistent across all your servers with minimal setup.

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/besync.git
cd besync
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build the project
```bash
npm run build
```

### 4. Create your first configuration
Create a new file in `configs/` directory, for example `configs/my_ssh_config.json`:

```json
{
  "source": "~/.ssh/config",
  "destinationMachines": ["user@server1.example.com", "user@server2.example.com"],
  "cachePath": "cache/ssh_config",
  "rsyncOptions": ["-avz", "--delete"]
}
```

### 5. Run the synchronization

**Single configuration:**
```bash
node dist/index.js configs/my_ssh_config.json
```

**All configurations:** (when no config path is specified)
```bash
node dist/index.js
```

### 6. (Optional) Set up automatic synchronization
Add to your crontab:

**Single configuration:**
```bash
*/5 * * * * /usr/bin/node /path/to/besync/dist/index.js configs/my_ssh_config.json
```

**All configurations:**
```bash
*/5 * * * * /usr/bin/node /path/to/besync/dist/index.js
```

## 📖 Configuration Examples

### Example 1: SSH Config Synchronization
```json
{
  "source": "~/.ssh/config",
  "destinationMachines": ["admin@prod-server.com", "admin@staging-server.com"],
  "cachePath": "cache/ssh_config",
  "rsyncOptions": ["-avz", "--delete"]
}
```

### Example 2: Nginx Configuration Synchronization
```json
{
  "source": "/etc/nginx/nginx.conf",
  "destinationMachines": ["root@web1.example.com", "root@web2.example.com"],
  "cachePath": "cache/nginx_conf",
  "rsyncOptions": ["-avz", "--delete", "--chmod=644"]
}
```

### Example 3: Directory Synchronization
```json
{
  "source": "~/projects/my-app/config/",
  "destinationMachines": ["deploy@app-server1.com", "deploy@app-server2.com"],
  "cachePath": "cache/app_config",
  "rsyncOptions": ["-avz", "--delete", "--exclude=*.log"]
}
```

### Example 4: Full Project Directory Synchronization
```json
{
  "source": "~/projects/web-app/",
  "destinationMachines": ["deploy@web-server1.com", "deploy@web-server2.com"],
  "cachePath": "cache/nginx_app",
  "rsyncOptions": ["-avz", "--delete", "--exclude=node_modules/", "--exclude=.git/"]
}
```

## 📂 Project Structure

```
besync/
├── src/
│   ├── index.ts          # Main entry point
│   ├── sync.ts           # Synchronization logic
│   └── utils.ts          # Logging utilities
├── configs/              # Your configuration files go here
│   ├── ssh_config.json   # Example configuration
│   └── my_config.json    # Your custom config
├── cache/                # Local cache of synchronized files
├── dist/                 # Compiled JavaScript (auto-generated)
├── besync.log            # General log file
├── configs/
│   └── *.log             # Per-configuration log files
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration Options

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| `source` | Path to source file/directory | Yes | - |
| `destinationMachines` | Array of SSH targets (`user@host`) | Yes | - |
| `cachePath` | Local cache path | Yes | - |
| `rsyncOptions` | Array of rsync options | No | `["-avz", "--delete"]` |

## 📝 Common Rsync Options

| Option | Description |
|--------|-------------|
| `-a` | Archive mode (preserves permissions, ownership, etc.) |
| `-v` | Verbose output |
| `-z` | Compress data during transfer |
| `--delete` | Delete files in destination that don't exist in source |
| `--exclude=PATTERN` | Exclude files matching PATTERN |
| `--chmod=MODE` | Set file permissions |
| `--dry-run` | Perform a trial run with no changes |

## 📋 Logging

BeSync provides comprehensive logging:

### General Log (`besync.log`)
Contains all operations from all configurations:
```
[2025-12-31T01:50:36.158Z] [INFO] Starting sync for ~/.ssh/config
[2025-12-31T01:50:36.181Z] [SUCCESS] Synced ~/.ssh/config to user@server1
```

### Configuration-specific Logs
Each configuration gets its own log file in `configs/`:
```
[2025-12-31T01:50:36.158Z] [INFO] Starting sync for ~/.ssh/config
[2025-12-31T01:50:36.181Z] [ERROR] Failed to sync ~/.ssh/config to user@server2: Connection refused
```

## 🔐 SSH Setup

For passwordless SSH access (recommended):

1. Generate SSH keys (if you haven't already):
   ```bash
   ssh-keygen -t ed25519
   ```

2. Copy your public key to target machines:
   ```bash
   ssh-copy-id user@target-machine
   ```

3. Test SSH connection:
   ```bash
   ssh user@target-machine
   ```

## 🛠 Requirements

- Node.js v16 or later
- TypeScript
- SSH access to target machines
- `rsync` installed on all machines (source and targets)

## 📋 Code Quality

This project includes:
- **ESLint**: TypeScript linting with strict rules
- **Strict TypeScript**: Comprehensive type checking with strict compiler options
- **Pre-commit hooks**: Recommended to run `npm run lint` before committing

### Available Scripts

```bash
# Build the project
npm run build

# Run ESLint
npm run lint

# Run ESLint with auto-fix
npm run lint:fix

# Run the application
node dist/index.js [config-path]
```

## 🐛 Troubleshooting

### SSH Connection Issues
- **Problem**: `ssh: Could not resolve hostname`
  - **Solution**: Verify the hostname is correct and the machine is reachable

- **Problem**: `Permission denied (publickey)`
  - **Solution**: Set up SSH keys properly and ensure they're added to the SSH agent

### Rsync Errors
- **Problem**: `rsync: connection unexpectedly closed`
  - **Solution**: Check that rsync is installed on the target machine

- **Problem**: `rsync: failed to set permissions`
  - **Solution**: Ensure the user has write permissions on the target directory

### Permission Issues
- **Problem**: Cannot create log files
  - **Solution**: Ensure the application has write permissions in the project directory

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Support

If you find this project useful, please consider:
- ⭐ Star the repository
- 🐛 Reporting issues
- 💬 Sharing your use cases
- 🤝 Contributing code

For questions or issues, please open an issue on the GitHub repository.

---

**BeSync** - Keep your files in sync, effortlessly! 🚀
