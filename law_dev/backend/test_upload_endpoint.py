import requests
import os

# Create a dummy file
with open("test_doc.txt", "w") as f:
    f.write("This is a test case document. The defendant is accused of theft.")

url = "http://127.0.0.1:8000/api/document/upload"
files = {'file': open('test_doc.txt', 'rb')}

try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
finally:
    files['file'].close()
    os.remove("test_doc.txt")
