import urllib.request
import json
import ssl

ctx = ssl._create_unverified_context()
headers={
"Authorization": "Bearer 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", 
"Content-Type": "application/json",
"User-Agent": "MyWarehouseApp/1.0"
}

req = urllib.request.Request(
    "https://api.groq.com/openai/v1/chat/completions", 
    data=json.dumps({"model": "llama3-8b-8192", "messages": [{"role": "user", "content": "hi"}], "max_tokens": 10}).encode("utf-8"), 
    headers=headers
)
try:
    response = urllib.request.urlopen(req, context=ctx)
    print("SUCCESS")
except Exception as e:
    print(e.read().decode())
