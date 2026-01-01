# BeSync - File Synchronization Utility over SSH

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

BeSync is a simple yet powerful TypeScript utility for synchronizing files and folders between multiple machines using SSH and `rsync`. It maintains a local cache and performs two-way synchronization to ensure all machines have consistent, up-to-date files.

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
  "source": "~/.ssh",
  "sourceMachines": ["server1", "server2"],
  "cachePath": "cache/ssh_config",
  "rsyncOptions": ["-avz"],
  "exclude": ["known_hosts", "authorized_keys"]
}
```

### 5. Run synchronization

**Single configuration:**
```bash
besync sync configs/my_ssh_config.json
```

**All configurations in folder:**
```bash
besync sync configs/
```

### 6. Delete a file from cache and all machines
```bash
besync delete configs/my_ssh_config.json config
```

### 7. (Optional) Set up automatic synchronization
Add to your crontab:

```bash
*/5 * * * * /usr/bin/node /path/to/besync/dist/index.js sync configs/
```

Or using the besync command (after npm link):
```bash
*/5 * * * * besync sync /path/to/besync/configs/
```

## 📖 How It Works

BeSync uses a **pull-push** strategy with a local cache:

### Stage 1: Pull
Updates local cache from each machine:
- Newer files on remote machines replace older files in cache
- New files are added to cache
- Files are never deleted from cache

### Stage 2: Push
Updates each machine from the cache:
- Files from cache are pushed to all machines
- Newer files in cache replace older files on remote
- Files are never deleted from remote machines

This ensures:
- All machines always have the same set of files
- Files are only added/updated, never deleted
- Conflicts are resolved in favor of newer files

## 📖 Configuration Examples

### Example 1: SSH Config Synchronization
```json
{
  "source": "~/.ssh",
  "sourceMachines": ["luna", "squid", "mint", "bigapple"],
  "cachePath": "cache/ssh_config",
  "rsyncOptions": ["-avz"],
  "exclude": ["known_hosts", "authorized_keys"]
}
```

### Example 2: Nginx Configuration Synchronization
```json
{
  "source": "/etc/nginx",
  "sourceMachines": ["web1", "web2"],
  "cachePath": "cache/nginx",
  "rsyncOptions": ["-avz"],
  "exclude": ["*.log"]
}
```

### Example 3: Project Directory Synchronization
```json
{
  "source": "~/projects/app/config/",
  "sourceMachines": ["server1", "server2", "server3"],
  "cachePath": "cache/app_config",
  "rsyncOptions": ["-avz"],
  "exclude": ["*.tmp", "*.bak"]
}
```

## 📂 Project Structure

```
besync/
├── src/
│   ├── index.ts          # Main entry point
│   ├── sync.ts           # Synchronization logic
│   ├── delete.ts         # File deletion utility
│   └── utils.ts          # Logging utilities
├── configs/              # Configuration files (*.json)
├── cache/                # Local cache of synchronized files
├── dist/                 # Compiled JavaScript (auto-generated)
├── besync.log            # General log file
├── configs/*.log         # Per-configuration log files
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration Options

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| `source` | Path to source directory | Yes | - |
| `sourceMachines` | Array of SSH hostnames | Yes | - |
| `cachePath` | Local cache path | Yes | - |
| `rsyncOptions` | Array of rsync options | No | `["-avz"]` |
| `exclude` | Array of file patterns to exclude | No | `[]` |

## 📝 Common Rsync Options

| Option | Description |
|--------|-------------|
| `-a` | Archive mode (preserves permissions, ownership, etc.) |
| `-v` | Verbose output |
| `-z` | Compress data during transfer |
| `--update` | Skip files that are newer on destination |
| `--ignore-existing` | Skip updating files that exist on destination |
| `--exclude=PATTERN` | Exclude files matching PATTERN |
| `--chmod=MODE` | Set file permissions |
| `--dry-run` | Perform a trial run with no changes |

## 📋 Command Line Interface

```bash
besync sync <folder-or-config>    Sync all configs in folder or single config
besync delete <config> <file>     Delete file from cache and all machines
```

## 📋 Logging

BeSync provides comprehensive logging:

### General Log (`besync.log`)
Contains all operations:
```
[2025-12-31T01:50:36.158Z] [INFO] Starting sync for ~/.ssh with 4 machines
[2025-12-31T01:50:36.181Z] [INFO] Stage 1: Pulling updates from 4 machines to cache
[2025-12-31T01:50:37.158Z] [SUCCESS] Pulled updates from luna
[2025-12-31T01:50:38.158Z] [SUCCESS] Pulled updates from squid
...
```

### Configuration-specific Logs
Each configuration gets its own log file in `configs/`:
```
[2025-12-31T01:50:36.158Z] [INFO] Starting sync for ~/.ssh
[2025-12-31T01:50:37.158Z] [SUCCESS] Pulled updates from luna
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

3. Configure hostnames in `~/.ssh/config` so you can use short names like `luna`, `squid` instead of `user@host`

## 🛠 Requirements

- Node.js v16 or later
- TypeScript
- SSH access to target machines
- `rsync` installed on all machines (source and targets)

## 📋 Available Scripts

```bash
# Build the project
npm run build

# Run ESLint
npm run lint

# Run ESLint with auto-fix
npm run lint:fix

# Run sync (all configs in configs/)
besync sync configs/

# Run sync (single config)
besync sync configs/my_config.json

# Delete file from cache and all machines
besync delete configs/my_config.json config
```

## 🐛 Troubleshooting

### SSH Connection Issues
- **Problem**: `ssh: Could not resolve hostname`
  - **Solution**: Verify the hostname is correct and exists in your `~/.ssh/config`

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

This project is licensed under the MIT License.

## 🙏 Support

If you find this project useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting issues
- 💬 Sharing your use cases
- 🤝 Contributing code

---

**BeSync** - Keep your files in sync, effortlessly! 🚀
