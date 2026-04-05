use eyre::{Result, eyre};

use crate::config::NexusConfig;
use crate::errors::ProjectError;
use std::env;
use std::path::{Path, PathBuf};

pub struct ProjectContext {
    /// The root directory of the project
    pub root: PathBuf,
    pub config: NexusConfig,
    /// The path to the .sensibledb directory (including ".sensibledb")
    pub nexus_dir: PathBuf,
}

impl ProjectContext {
    /// Find and load the project context starting from the given directory
    pub fn find_and_load(start_dir: Option<&Path>) -> Result<Self, ProjectError> {
        let start = match start_dir {
            Some(dir) => dir.to_path_buf(),
            None => env::current_dir().map_err(|source| ProjectError::CurrentDir { source })?,
        };

        let root = find_project_root(&start)?;
        let config_path = root.join("sensibledb.toml");
        let config = NexusConfig::from_file(&config_path)?;
        let nexus_dir = root.join(".sensibledb");

        Ok(ProjectContext {
            root,
            config,
            nexus_dir,
        })
    }

    /// Get the workspace directory for a specific instance
    pub fn instance_workspace(&self, instance_name: &str) -> PathBuf {
        self.nexus_dir.join(instance_name)
    }

    /// Get the volumes directory for persistent data
    pub fn volumes_dir(&self) -> PathBuf {
        self.nexus_dir.join(".volumes")
    }

    /// Get the volume path for a specific instance
    pub fn instance_volume(&self, instance_name: &str) -> PathBuf {
        self.volumes_dir().join(instance_name)
    }

    /// Get the docker-compose file path for an instance
    pub fn docker_compose_path(&self, instance_name: &str) -> PathBuf {
        self.instance_workspace(instance_name)
            .join("docker-compose.yml")
    }

    /// Get the Dockerfile path for an instance
    pub fn dockerfile_path(&self, instance_name: &str) -> PathBuf {
        self.instance_workspace(instance_name).join("Dockerfile")
    }

    /// Get the compiled container directory for an instance
    pub fn container_dir(&self, instance_name: &str) -> PathBuf {
        self.instance_workspace(instance_name)
            .join("sensibledb-container")
    }

    /// Ensure all necessary directories exist for an instance
    pub fn ensure_instance_dirs(&self, instance_name: &str) -> Result<(), ProjectError> {
        let workspace = self.instance_workspace(instance_name);
        let volume = self.instance_volume(instance_name);
        let container = self.container_dir(instance_name);

        std::fs::create_dir_all(&workspace).map_err(|source| ProjectError::CreateDir {
            path: workspace,
            source,
        })?;
        std::fs::create_dir_all(&volume).map_err(|source| ProjectError::CreateDir {
            path: volume,
            source,
        })?;
        std::fs::create_dir_all(&container).map_err(|source| ProjectError::CreateDir {
            path: container,
            source,
        })?;

        Ok(())
    }
}

/// Find the project root by looking for sensibledb.toml file
fn find_project_root(start: &Path) -> Result<PathBuf, ProjectError> {
    let mut current = start.to_path_buf();

    loop {
        let config_path = current.join("sensibledb.toml");
        if config_path.exists() {
            return Ok(current);
        }

        // Check for old v1 config.hx.json file
        let v1_config_path = current.join("config.hx.json");
        if v1_config_path.exists() {
            return Err(ProjectError::LegacyConfig {
                path: v1_config_path,
                root: current,
            });
        }

        match current.parent() {
            Some(parent) => current = parent.to_path_buf(),
            None => break,
        }
    }

    Err(ProjectError::ConfigNotFound {
        start: start.to_path_buf(),
    })
}

pub fn get_nexus_cache_dir() -> Result<PathBuf> {
    // Allow override for testing - tests can set SENSIBLE_CACHE_DIR to use isolated directories
    if let Ok(override_dir) = std::env::var("SENSIBLE_CACHE_DIR") {
        let nexus_dir = PathBuf::from(override_dir);
        std::fs::create_dir_all(&nexus_dir)?;
        return Ok(nexus_dir);
    }

    let home = dirs::home_dir().ok_or_else(|| eyre!("Cannot find home directory"))?;
    let nexus_dir = home.join(".sensibledb");

    // Check if this is a fresh installation (no .sensibledb directory exists)
    let is_fresh_install = !nexus_dir.exists();

    std::fs::create_dir_all(&nexus_dir)?;

    // For fresh installations, create .v2 marker to indicate this is a v2 nexus directory
    if is_fresh_install {
        let v2_marker = nexus_dir.join(".v2");
        std::fs::write(&v2_marker, "")?;
    }

    Ok(nexus_dir)
}

pub fn get_nexus_repo_cache() -> Result<PathBuf> {
    let nexus_dir = get_nexus_cache_dir()?;
    Ok(nexus_dir.join("repo"))
}
