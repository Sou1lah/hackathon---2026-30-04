import http.client

try:
    conn = http.client.HTTPConnection("localhost", 8000)
    conn.request("GET", "/api/v1/login/test-token")
    res = conn.getresponse()
    print(f"Status: {res.status}")
    print(res.read().decode())
except Exception as e:
    print(f"Error: {e}")
