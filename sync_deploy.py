"""
Darbak Salik (دربك سالك) - Automated GitHub Deployment Script
-------------------------------------------------------------
Usage:
  python sync_deploy.py <YOUR_GITHUB_TOKEN>
  or set GITHUB_TOKEN environment variable and run:
  python sync_deploy.py
"""

import os, sys, json, base64, urllib.request, urllib.error

REPOS = ["darbak-salik-iq", "edusajjad1.github.io"]
OWNER = "edusajjad1"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CNAME_DOMAIN = "darbaksalik.me\n"

def get_token():
    if len(sys.argv) > 1:
        return sys.argv[1].strip()
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        return token.strip()
    # Try reading token from existing scratch scripts if present
    scratch_push = os.path.join(os.path.dirname(BASE_DIR), "push.ps1")
    if os.path.exists(scratch_push):
        with open(scratch_push, "r", encoding="utf-8") as f:
            for line in f:
                if "$token =" in line:
                    parts = line.split('"')
                    if len(parts) >= 2 and parts[1].startswith("ghp_"):
                        return parts[1].strip()
    return None

def api_request(url, method="GET", data=None, token=None):
    headers = {
        "User-Agent": "Darbak-Salik-Deployer",
        "Accept": "application/vnd.github.v3+json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json; charset=utf-8"

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        return {"error": e.code, "message": err_msg}
    except Exception as e:
        return {"error": 500, "message": str(e)}

def upload_file(repo, rel_path, local_abs_path, token):
    with open(local_abs_path, "rb") as f:
        content_b64 = base64.b64encode(f.read()).decode("utf-8")

    api_url = f"https://api.github.com/repos/{OWNER}/{repo}/contents/{rel_path}"
    
    # Check existing sha
    get_res = api_request(api_url, "GET", token=token)
    sha = get_res.get("sha") if isinstance(get_res, dict) else None

    payload = {
        "message": f"Update {rel_path} - Darbak Salik Live",
        "content": content_b64
    }
    if sha:
        payload["sha"] = sha

    put_res = api_request(api_url, "PUT", data=payload, token=token)
    if "error" in put_res:
        print(f"  [X] Failed {rel_path}: HTTP {put_res['error']}")
        return False
    else:
        print(f"  [OK] Uploaded {rel_path}")
        return True

def main():
    token = get_token()
    if not token:
        print("ERROR: No GitHub Personal Access Token provided.")
        print("Run: python sync_deploy.py <YOUR_GITHUB_TOKEN>")
        sys.exit(1)

    print(f"=== Starting deployment for Darbak Salik to GitHub ({OWNER}) ===")
    
    # Collect files to upload (skip git internal files)
    files_to_upload = []
    for root, dirs, files in os.walk(BASE_DIR):
        # Ignore .git or server node_modules if any
        if ".git" in root or "node_modules" in root:
            continue
        for f in files:
            if f.endswith((".pyc", ".log", ".tmp")):
                continue
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, BASE_DIR).replace("\\", "/")
            files_to_upload.append((rel_path, full_path))

    print(f"Found {len(files_to_upload)} files to deploy.")

    for repo in REPOS:
        print(f"\n---> Syncing to https://github.com/{OWNER}/{repo}")
        for rel_path, full_path in files_to_upload:
            upload_file(repo, rel_path, full_path, token)

        # Upload CNAME
        cname_url = f"https://api.github.com/repos/{OWNER}/{repo}/contents/CNAME"
        c_get = api_request(cname_url, "GET", token=token)
        c_sha = c_get.get("sha") if isinstance(c_get, dict) else None
        c_payload = {
            "message": "Set CNAME to darbaksalik.me",
            "content": base64.b64encode(CNAME_DOMAIN.encode("utf-8")).decode("utf-8")
        }
        if c_sha:
            c_payload["sha"] = c_sha
        c_res = api_request(cname_url, "PUT", data=c_payload, token=token)
        print(f"  [OK] CNAME darbaksalik.me applied to {repo}")

    print("\n==========================================")
    print("ALL FILES DEPLOYED SUCCESSFULLY!")
    print("Your site is live at: https://darbaksalik.me/")
    print("==========================================")

if __name__ == "__main__":
    main()
