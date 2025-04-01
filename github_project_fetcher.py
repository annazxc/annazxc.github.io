import requests
import json
import base64
import re
import os
from datetime import datetime
from bs4 import BeautifulSoup

def fetch_github_projects(username, token=None):
    """
    Fetch GitHub projects for a specific user
    
    Args:
        username (str): GitHub username
        token (str, optional): GitHub personal access token for authentication
    
    Returns:
        list: List of project dictionaries
    """
    headers = {}
    if token:
        headers["Authorization"] = f"token {token}"
    
    url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=100"
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print(f"Error fetching repositories: {response.status_code}")
        print(response.text)
        return []
    
    repos = response.json()
    projects = []
    
    for repo in repos:
        if repo.get("fork", False):  # Skip forked repositories
            continue
            
        repo_name = repo["name"]
        repo_url = repo["html_url"]
        
        # Get the description (from repo or README)
        description = repo.get("description", "")
        
        # Try to fetch README content and extract description
        readme_info = get_readme_content(username, repo_name, token)
        if readme_info:
            extracted_desc = extract_description_from_readme(readme_info)
            if extracted_desc and (not description or len(description) < len(extracted_desc)):
                description = extracted_desc
        
        if not description:
            description = "No description available."
        
        # Get the repository creation year
        created_at = repo.get("created_at", "")
        creation_year = ""
        if created_at:
            try:
                creation_year = datetime.strptime(created_at, "%Y-%m-%dT%H:%M:%SZ").year
            except:
                pass
        
        # Find notebook files in the repository
        notebook_files = []
        is_notebook_repo = False
        
        # Check if the repo itself is a notebook
        if repo_name.endswith(".ipynb"):
            is_notebook_repo = True
            notebook_files.append({
                "name": repo_name,
                "path": repo_name,
                "url": f"{repo_url}/blob/main/{repo_name}"
            })
        
        # Otherwise, try to find notebooks in the repository
        else:
            notebooks = find_notebooks_in_repo(username, repo_name, token)
            if notebooks:
                notebook_files = notebooks
                is_notebook_repo = True
        
        # Set the project URL - direct to notebook file if only one notebook found
        if is_notebook_repo and len(notebook_files) == 1:
            project_url = notebook_files[0]["url"]
        else:
            project_url = repo_url
        
        # Determine language and tech stack
        language = repo.get("language", "")
        
        # Get image URL (will be populated later if needed)
        image_url = f"/assets/{repo_name.lower()}.png"  # Default naming convention
        
        projects.append({
            "name": repo_name,
            "url": project_url,
            "repo_url": repo_url,
            "description": description,
            "language": language,
            "stars": repo.get("stargazers_count", 0),
            "forks": repo.get("forks_count", 0),
            "is_notebook_repo": is_notebook_repo,
            "notebook_files": notebook_files,
            "last_updated": repo.get("updated_at", ""),
            "created_at": created_at,
            "year": creation_year or "N/A",
            "image_url": image_url
        })
    
    # Sort projects by last_updated (most recent first)
    projects.sort(key=lambda x: x["last_updated"], reverse=True)
    return projects

def get_readme_content(username, repo_name, token=None):
    """Fetch README content from a repository"""
    headers = {}
    if token:
        headers["Authorization"] = f"token {token}"
    
    # Try common README filenames and branches
    for branch in ["main", "master"]:
        for filename in ["README.md", "Readme.md", "readme.md"]:
            url = f"https://api.github.com/repos/{username}/{repo_name}/contents/{filename}?ref={branch}"
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                content_data = response.json()
                if content_data.get("encoding") == "base64" and content_data.get("content"):
                    try:
                        decoded_content = base64.b64decode(content_data["content"]).decode("utf-8")
                        return decoded_content
                    except:
                        pass
    
    return None

def find_notebooks_in_repo(username, repo_name, token=None):
    """Find Jupyter notebook files in a repository"""
    headers = {}
    if token:
        headers["Authorization"] = f"token {token}"
    
    # First try to get the list of files in the root directory
    url = f"https://api.github.com/repos/{username}/{repo_name}/contents"
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        return []
    
    contents = response.json()
    notebooks = []
    
    # Process files and directories
    for item in contents:
        if item["type"] == "file" and item["name"].endswith(".ipynb"):
            notebooks.append({
                "name": item["name"],
                "path": item["path"],
                "url": f"https://github.com/{username}/{repo_name}/blob/main/{item['path']}"
            })
    
    return notebooks

def extract_description_from_readme(readme_text):
    """Extract a brief description from README content"""
    # Try to find the first heading or paragraph
    lines = readme_text.split('\n')
    
    # First look for a heading without # in the content
    for line in lines:
        # Match a heading (# Heading)
        if re.match(r'^#+ (.+)', line):
            heading_text = re.match(r'^#+ (.+)', line).group(1).strip()
            if heading_text and heading_text.lower() not in ["table of contents", "contents", "introduction"]:
                return heading_text
    
    # Then look for the first paragraph
    paragraph = ""
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#') and not line.startswith('!') and not line.startswith('-'):
            paragraph += line + " "
        elif paragraph:  # If we've started collecting a paragraph and hit a break
            break
    
    # Try to find any project purpose statement
    purpose_match = re.search(r'This project (aims|tries|attempts|seeks) to (.+?)(\.|\n)', readme_text, re.IGNORECASE)
    if purpose_match:
        return purpose_match.group(0)
    
    # Truncate the paragraph if it's too long
    if len(paragraph) > 150:
        return paragraph[:147] + "..."
    
    return paragraph.strip() or "No description available."

def analyze_code_for_summary(username, repo_name, token=None):
    """Attempt to analyze repository content for better description"""
    # This is a placeholder for more advanced code analysis
    # In a real implementation, you could:
    # 1. Analyze imports to determine technologies used
    # 2. Look at code structure to determine project type
    # 3. Use NLP on comments to extract purpose
    return None

def update_projects_html(projects):
    """Generate HTML for projects in an accordion format matching the desired style"""
    projects_html = ""
    first_item = True  # Track the first item to set it as expanded
    
    for i, project in enumerate(projects):
        # Create a clean ID from the project name
        project_id = re.sub(r'[^a-zA-Z0-9]', '-', project['name'].lower())
        
        # Set the first accordion item to be expanded
        expanded = "true" if first_item else "false"
        show_class = "show" if first_item else ""
        first_item = False
        
        # Format the description sections
        description_parts = project['description'].split('\n')
        description_html = ""
        
        if len(description_parts) >= 1:
            description_html += f'<p><strong>{description_parts[0]}</strong></p>'
        
        for part in description_parts[1:]:
            if part.strip():
                description_html += f'<p>{part}</p>'
        
        # If description is short, make sure we have at least a couple of lines
        if len(description_parts) <= 1:
            if project.get('language'):
                description_html += f'<p>Built with {project["language"]}</p>'
            if project.get('is_notebook_repo'):
                description_html += f'<p>This is a Jupyter notebook project.</p>'
        
        # Determine project URL - use direct link to notebook if available
        project_url = project['url']
        
        # Generate the HTML with the desired structure
        projects_html += f'''
        <div class="accordion-item">
            <h3 class="accordion-header" id="heading-{project_id}">
                <button class="accordion-button {'' if show_class else 'collapsed'}" type="button" 
                        data-bs-toggle="collapse" data-bs-target="#collapse-{project_id}" 
                        aria-expanded="{expanded}" aria-controls="collapse-{project_id}">
                    {project['name']}
                </button>
            </h3>
            <div id="collapse-{project_id}" class="accordion-collapse collapse {show_class}" 
                 aria-labelledby="heading-{project_id}" data-bs-parent="#others">
                <div class="accordion-body">
                    <div class="row">
                        <div class="col-md-4 mb-3 mb-md-0">
                            <img src="{project['image_url']}" class="img-fluid rounded" alt="{project['name']}">
                        </div>
                        <div class="col-md-8">
                            {description_html}
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <div class="btn-group mx-auto">
                                <a href="{project_url}" class="btn btn-sm btn-outline-primary" 
                                   target="_blank" rel="noopener noreferrer">View Details</a>
                            </div>
                            <small class="text-muted">{project['year']}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        '''
    
    return projects_html

# Example usage
if __name__ == "__main__":
    username = "annazxc"
    # For authenticated requests (recommended):
    # token = "your_personal_access_token"
    # projects = fetch_github_projects(username, token)
    
    # For unauthenticated requests (limited to 60/hour):
    projects = fetch_github_projects(username)
    
    if projects:
        projects_section = update_projects_html(projects)
        
        # Optionally save to file
        with open("github_projects.html", "w", encoding="utf-8") as f:
            f.write(projects_section)
        print(f"Generated HTML for {len(projects)} projects")
        
        # Create a simple check for image files
        print("\nChecking for image files:")
        for project in projects:
            image_path = project['image_url'].replace('/assets/', '')
            if os.path.exists(image_path):
                print(f"✓ Found image for {project['name']}")
            else:
                print(f"✗ Missing image for {project['name']} - expected at {image_path}")
    else:
        print("No projects found or error occurred")