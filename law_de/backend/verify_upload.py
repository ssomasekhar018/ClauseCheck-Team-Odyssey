import urllib.request
import urllib.error
import uuid
import os

url = "http://127.0.0.1:8000/api/document/upload"
filepath = "test_case.txt"
content = "This is a test case. John Doe is accused of stealing a car on Jan 1st 2024. Witnesses say he was seen driving the car."

with open(filepath, "w") as f:
    f.write(content)

# Prepare multipart request manually
boundary = uuid.uuid4().hex
headers = {
    "Content-Type": f"multipart/form-data; boundary={boundary}",
}

data = []
data.append(f"--{boundary}".encode())
data.append(f'Content-Disposition: form-data; name="file"; filename="{filepath}"'.encode())
data.append(f"Content-Type: text/plain".encode())
data.append(b"")
data.append(content.encode())
data.append(f"--{boundary}--".encode())
data.append(b"")
body = b"\r\n".join(data)

print(f"Uploading to {url}...")
req = urllib.request.Request(url, data=body, headers=headers, method="POST")

try:
    with urllib.request.urlopen(req) as response:
        result = response.read().decode()
        print(f"Status: {response.status}")
        print(f"Response: {result}")
        if response.status == 200:
            print("SUCCESS: Upload verified.")
        else:
            print("FAILURE: Status not 200")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} {e.reason}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
finally:
    if os.path.exists(filepath):
        os.remove(filepath)
