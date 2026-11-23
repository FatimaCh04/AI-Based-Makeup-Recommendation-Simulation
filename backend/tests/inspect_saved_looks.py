import json

with open('backend/data/users.json', 'r', encoding='utf-8') as f:
    users = json.load(f)

for u in users:
    if u.get('name') == 'Fatima Choudhry':
        print(f"User: {u.get('name')}, Email: {u.get('email')}")
        for idx, l in enumerate(u.get('saved_looks', [])):
            print(f"\n--- Look {idx} ---")
            print("ID:", l.get("id"))
            print("Title:", l.get("title"))
            print("Event:", l.get("event"))
            print("Date:", l.get("date"))
            print("Shades:", json.dumps(l.get("shades", {}), indent=2))
            thumb = l.get("thumbnail") or ""
            print("Thumbnail starts with:", thumb[:40], "length:", len(thumb))
            orig = l.get("original_image") or ""
            print("Original starts with:", orig[:40], "length:", len(orig))
