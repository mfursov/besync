# BeSync - SSH File Synchronization

Two-way file sync over SSH with local cache. All machines stay in sync with the newest files.

## Install

```bash
npm install -g besync-cli
```

## Quick Usage

```bash
# Create config in configs/my-projects.json
{
  "source": "~/projects",
  "sourceMachines": ["ram", "squid", "mint"],
  "cachePath": "cache/projects",
  "exclude": ["project1", "project2"]
}

# Sync all configs
besync sync configs/

# Sync single config
besync sync configs/my-projects.json

# Delete file from all machines
besync delete configs/my-projects.json project3
```

## How It Works

1. **Pull**: Fetch the newest files from each machine to local cache
2. **Push**: Push cache files to all machines (newer replaces older)

## Cron

```bash
*/5 * * * * besync sync /path/to/configs/
```

## Requirements

- Node.js 16+
- rsync on all machines
- SSH access to all machines
