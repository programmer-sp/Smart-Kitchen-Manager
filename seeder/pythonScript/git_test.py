import os
import shutil
from dotenv import load_dotenv
import subprocess
import urllib.parse

# Load environment variables from the .env file
load_dotenv(override=True)

def test_git_env():
    """
    Tests the environment variables for Git integration by attempting to clone a repository.
    Deletes the existing directory if it exists before cloning.
    """
    git_repo_url = os.getenv("GIT_REPO_URL")
    git_branch = os.getenv("GIT_BRANCH", "main")
    git_username = os.getenv("GIT_USERNAME")
    git_password = urllib.parse.quote_plus(os.getenv("GIT_PASSWORD", ""))

    if not git_repo_url:
        print("Error: GIT_REPO_URL is not set in the environment variables.")
        return

    if git_username and git_password:
        # Include credentials in the clone command for a private repo
        auth_repo_url = git_repo_url.replace("https://", f"https://{git_username}:{git_password}@")
    else:
        # Use the provided URL as-is for public repos
        auth_repo_url = git_repo_url

    clone_dir = "/tmp/git_test_repo"

    # Check if the directory exists, and delete it if it does
    if os.path.exists(clone_dir):
        shutil.rmtree(clone_dir)
        print(f"Deleted existing directory: {clone_dir}")

    try:
        # Clone the repository
        result = subprocess.run(
            ["git", "clone", "-b", git_branch, auth_repo_url, clone_dir],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        print(f"Repository cloned successfully to {clone_dir}.")
    except subprocess.CalledProcessError as e:
        print(f"Failed to clone repository: {e.stderr.decode()}")

if __name__ == "__main__":
    test_git_env()
