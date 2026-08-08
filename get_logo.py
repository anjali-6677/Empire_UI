import urllib.request

url = "https://flutebyte.com/wp-content/uploads/2025/02/flutebyte_logo.png"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
data = urllib.request.urlopen(req).read()

with open("public/flutebyte-logo.png", "wb") as f:
    f.write(data)

print(f"Downloaded logo successfully! Size: {len(data)} bytes")
