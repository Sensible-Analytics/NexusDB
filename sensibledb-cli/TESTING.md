# SensibleDB CLI Testing Guide

For each of these, make sure you're in the sensibledb-cli directory.
Then, create a directory called test-(some name).
`cd` into that directory.
Instead of the `nexus` command in the commands below, use `cargo run -- <args passed to nexus>`.

## Local Flows (Non-Cloud Testing)

- `nexus init` with default settings; check sensibledb.toml created with empty template and ./db/ queries path
- `nexus init --path /custom/path` with custom directory; verify project created in specified location
- `nexus init --template custom_template` with custom template; confirm template applied correctly
- `nexus init --queries-path ./custom-queries/` with custom queries directory; validate queries path set correctly
- `nexus check` to validate all instances; verify all configurations and queries validated
- `nexus check my-instance` to validate specific instance; confirm only specified instance checked
- `nexus compile` to compile queries; verify queries compiled to default output
- `nexus compile --path ./custom-output --output my-instance` with custom settings; check compilation to specified path and instance
- `nexus build my-instance` to build local Docker instance; verify Dockerfile and docker-compose.yml generated; confirm Docker image built successfully
- `nexus push my-instance` to deploy local Docker instance; verify container starts and is accessible on configured port
- `nexus start my-instance` to start existing local Docker instance; verify container starts without rebuild
- `nexus stop my-instance` to stop running local Docker instance; confirm container stops cleanly
- `nexus status` to view all instances; confirm all instances listed with correct status and Docker container states
- `nexus prune` to clean unused resources; verify containers, images cleaned while preserving volumes
- `nexus prune my-instance` to clean specific instance resources; confirm only specified instance cleaned
- `nexus prune --all` to clean all instances; verify all project instances cleaned
- `nexus metrics full` to enable full metrics; verify metrics collection enabled
- `nexus metrics basic` to enable basic metrics; confirm reduced metrics collection
- `nexus metrics off` to disable metrics; verify metrics collection disabled
- `nexus metrics status` to check metrics state; confirm current metrics setting displayed
- `nexus update` to upgrade to latest version; verify CLI updated successfully
- `nexus update --force` to force update; confirm update proceeds even if already latest
- `nexus init` in directory with existing sensibledb.toml; verify appropriate error message
- `nexus build non-existent-instance` with invalid instance; confirm error for missing instance
- `nexus start my-instance` without building first; verify error about missing docker-compose.yml
- `nexus build my-instance` without Docker installed/running; confirm Docker availability error
- `nexus push my-instance` without Docker daemon running; verify Docker daemon error
- `nexus add` with conflicting instance names; verify duplicate name error

## Cloud/Remote Flows

## Project Initialization

- `nexus init --cloud` with cloud instance; verify cloud instance configured in sensibledb.toml
- `nexus init --cloud --cloud-region eu-west-1` with custom region; check region set correctly
- `nexus init --ecr` with ECR instance; confirm ECR instance added to config
- `nexus init --fly` with Fly.io instance; verify Fly instance created with default settings
- `nexus init --fly --fly-auth token --fly-volume-size 50 --fly-vm-size performance-2x --fly-public false` with custom Fly settings; check all parameters applied

## Instance Management

- `nexus add my-instance --cloud` to add cloud instance; verify instance added to existing project
- `nexus add my-ecr --ecr` to add ECR instance; confirm ECR instance configured
- `nexus add my-fly --fly --fly-volume-size 30` to add Fly instance with custom volume; check instance created with correct volume size
- `nexus delete my-instance` to remove instance; verify instance completely removed from config and infrastructure

## Build and Deployment

- `nexus build my-instance` to build instance; verify build process completes successfully
- `nexus push my-instance` to deploy instance; confirm instance deployed and running
- `nexus start my-instance` to start existing instance; verify instance starts without rebuild
- `nexus stop my-instance` to stop running instance; confirm instance stops cleanly

## Data Operations

- `nexus sync my-instance` to sync source files from remote; verify local queries updated from instance
- `nexus sync` in a workspace without sensibledb.toml; ensure standard and enterprise clusters are selectable

## Authentication

- `nexus auth login` to authenticate with Nexus cloud; verify login successful and credentials stored
- `nexus auth logout` to sign out; confirm credentials cleared
- `nexus auth create-key my-cluster` to generate API key; verify key created for specified cluster

## Error Scenarios

- `nexus push` without building first; verify appropriate build dependency error
- Commands requiring authentication without login; confirm proper authentication error messages
