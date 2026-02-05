# SyncMySubs

A simple tool to shift subtitle timings in an SRT file.

How to use

- Open [index.html](index.html) in a browser.
- Choose an `.srt` file, enter seconds to shift (positive to delay, negative to advance), then click `Apply & Download`.

Quick local server (optional)

```powershell
# from repository root
python -m http.server 8000
# then open http://localhost:8000/index.html
```
