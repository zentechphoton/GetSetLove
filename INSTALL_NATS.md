# 🔧 Installing NATS Server on Windows

## Option 1: Download Pre-built Binary (Recommended)

1. **Download NATS Server:**
   - Go to: https://github.com/nats-io/nats-server/releases
   - Download: `nats-server-v2.10.x-windows-amd64.zip` (latest version)
   - Extract the ZIP file

2. **Add to PATH:**
   ```bash
   # Copy nats-server.exe to a folder in your PATH, or:
   # Move it to: C:\Program Files\nats-server\
   # Then add to PATH environment variable
   ```

3. **Or run directly:**
   ```bash
   # Navigate to extracted folder
   cd path/to/nats-server-v2.10.x-windows-amd64
   ./nats-server.exe -js -m 8222 --store_dir=./nats-data
   ```

## Option 2: Using Chocolatey (If installed)

```bash
choco install nats-server
```

## Option 3: Using Go (If Go is installed)

```bash
go install github.com/nats-io/nats-server/v2@latest
# Then add $GOPATH/bin to PATH
```

## Option 4: Using Docker (If Docker is installed)

```bash
docker run -d -p 4222:4222 -p 8222:8222 -p 6222:6222 --name nats-server nats -js -m 8222
```

## Quick Test After Installation

```bash
nats-server -js -m 8222 --store_dir=./nats-data
```

You should see:
```
[INF] Starting nats-server
[INF] Server is ready
```

---

## ⚠️ Alternative: Run Without NATS (Limited Features)

If you can't install NATS right now, the backend will still work but:
- ❌ Real-time chat messages won't sync
- ❌ Typing indicators won't work
- ❌ Presence updates won't work
- ✅ GraphQL queries/mutations will work
- ✅ Messages will be saved to database

The backend will show a warning but continue running.

