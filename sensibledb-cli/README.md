# SensibleDB CLI

Command-line interface for managing Nexus projects and deployments.

## Commands

- `init`: initialize a new project with `sensibledb.toml`.
- `add`: add an instance to an existing project.
- `check`: validate config and queries.
- `compile`: compile queries into the workspace.
- `build`: build an instance (local or remote prep).
- `push`: deploy/start an instance.
- `sync`: sync source/config from SensibleDB Cloud (standard or enterprise).
- `start` / `stop` / `status`: manage running instances.
- `logs`: view or stream logs.
- `auth`: login/logout/create-key.
- `prune`: clean containers/images/workspaces.
- `delete`: remove an instance.
- `metrics`: manage telemetry level.
- `dashboard`: manage the Nexus Dashboard.
- `update`: update the CLI.
- `migrate`: migrate v1 projects to v2.
- `backup`: back up an instance.
- `feedback`: send feedback to the Nexus team.

Run `nexus <command> --help` for command-specific flags and options.

## Error handling

- Recoverable/library errors use `thiserror::Error` (config, project, port).
- CLI commands return `eyre::Result` and render `CliError` for consistent output.
