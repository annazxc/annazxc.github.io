import json
import sys

# Get filename from command line argument
if len(sys.argv) < 2:
    print("Usage: python fix.py create_RAG_vector_database.ipynb")
    sys.exit(1)

filename = sys.argv[1]

# Load notebook
try:
    with open(filename, 'r', encoding='utf-8') as f:
        notebook = json.load(f)
except Exception as e:
    print(f"Error loading notebook: {e}")
    sys.exit(1)

# Fix metadata.widgets
if 'metadata' in notebook and 'widgets' in notebook['metadata']:
    for widget in notebook['metadata']['widgets'].values():
        if 'state' not in widget:
            widget['state'] = {}
    print("Added missing 'state' keys to widgets metadata")
else:
    print("No widgets metadata found or it's already correctly formatted")

# Save fixed notebook
try:
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(notebook, f)
    print(f"Successfully fixed notebook: {filename}")
except Exception as e:
    print(f"Error saving notebook: {e}")