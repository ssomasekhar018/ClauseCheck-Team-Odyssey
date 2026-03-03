import sys
import os
import importlib
from pathlib import Path

def print_status(msg, status):
    symbol = "✅" if status else "❌"
    print(f"{symbol} {msg}")

def check_dependencies():
    print("\n--- Checking Dependencies ---")
    required = [
        "fastapi", "uvicorn", "python-dotenv", "openai", 
        "pdfplumber", "docx", "PyPDF2", "python-multipart"
    ]
    all_ok = True
    for pkg in required:
        try:
            if pkg == "python-dotenv":
                import dotenv
            elif pkg == "python-multipart":
                # python-multipart doesn't always expose a top-level module named multipart
                # often it's just used by fastapi. check if installed via pkg_resources or importlib
                try:
                    import multipart
                except ImportError:
                    # It might be installed but not importable as 'multipart' directly in some envs
                    # Try importing from fastapi which depends on it
                    from fastapi import UploadFile
            elif pkg == "docx":
                import docx
            else:
                importlib.import_module(pkg)
            print_status(f"{pkg} installed", True)
        except ImportError:
            print_status(f"{pkg} NOT installed", False)
            all_ok = False
    return all_ok

def check_env():
    print("\n--- Checking Environment Variables ---")
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except:
        pass
    
    keys = ["OPENAI_API_KEY"]
    all_ok = True
    for key in keys:
        val = os.getenv(key)
        if val and len(val) > 10:
            print_status(f"{key} found", True)
        else:
            print_status(f"{key} missing or empty", False)
            all_ok = False
    return all_ok

def check_write_permissions():
    print("\n--- Checking Write Permissions ---")
    try:
        with open("test_write_perm.tmp", "w") as f:
            f.write("test")
        os.remove("test_write_perm.tmp")
        print_status("Can write to current directory", True)
        return True
    except Exception as e:
        print_status(f"Cannot write to directory: {e}", False)
        return False

if __name__ == "__main__":
    print("Law Simulator System Check")
    deps = check_dependencies()
    env = check_env()
    perm = check_write_permissions()
    
    print("\n--- Summary ---")
    if deps and env and perm:
        print("✅ System is ready. You can start the backend.")
        print("Run: python app/main.py")
    else:
        print("❌ System has issues. Please fix them before starting.")
