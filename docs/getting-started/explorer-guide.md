# SensibleDB Explorer Quick Start

A step-by-step guide to get started with SensibleDB Explorer — your personal knowledge assistant.

## What You'll Need

- A Mac computer (macOS 12.0 or later)
- [SensibleDB Explorer app](https://github.com/Sensible-Analytics/SensibleDB/releases)

## Step 1: Download and Install

1. Visit the [Releases page](https://github.com/Sensible-Analytics/SensibleDB/releases)
2. Find the latest `explorer-v*` release
3. Download the `.dmg` file
4. Open the `.dmg` file
5. Drag "SensibleDB Explorer" to your Applications folder
6. **Important**: Right-click the app in Applications and select "Open" to bypass Gatekeeper (the app is not signed yet)

## Step 2: Add Your Documents

![SensibleDB Explorer Home](../assets/explorer-home.png)

When you first open the app, you'll see the home screen. Follow these steps:

1. Click **"Add Folder"** button
2. Navigate to the folder containing your documents
3. Select the folder and click **"Open"**

### Supported Documents

SensibleDB Explorer can process:
- 📄 PDF files
- 📝 Text files (.txt)
- 📋 Markdown files (.md)
- 📃 Word documents (.doc, .docx)

## Step 3: Wait for Processing

![SensibleDB Explorer Graph View](../assets/explorer-graph.png)

After adding a folder, the app will:
1. Scan all documents in the folder
2. Extract text and key information
3. Create embeddings (vector representations)
4. Build a knowledge graph

This may take a few minutes depending on folder size. You'll see progress in the app.

## Step 4: Chat with Your Documents

![SensibleDB Explorer Chat](../assets/explorer-chat.png)

Now you can ask questions about your documents!

**Example questions to try:**

- "What is this document about?"
- "Summarize the main points in the meeting notes"
- "Find all mentions of [topic]"
- "What decisions were made in the project folder?"

## Step 5: Explore Your Knowledge Graph

![SensibleDB Explorer Report View](../assets/explorer-report.png)

The graph view shows connections between concepts across your documents. You can:
- Click on nodes to see related information
- Zoom in/out to explore different areas
- Click on any item to see more details

## Tips for Best Results

1. **Organize your files** — Put related documents in the same folder
2. **Be patient** — First-time indexing takes time
3. **Ask specific questions** — "What did John say about X?" works better than vague queries

## About App Signing

⚠️ **Note**: The app is currently not signed by Apple, which is why you need to right-click > Open.

### Why Is It Not Signed?

Full code signing requires an **Apple Developer Program membership** ($99/year). We're working on securing proper signing.

### Workaround: How to Open the Unsigned App

1. **Right-click** on "SensibleDB Explorer" in Applications
2. Select **"Open"**
3. Click **"Open"** again in the dialog box
4. The app will now launch!

This is a one-time step. After first opening, the app will work normally.

### Alternatives We're Exploring

We researched alternatives to paid Apple Developer account:

| Option | Status |
|--------|--------|
| Ad-hoc signing | ❌ Doesn't pass Gatekeeper on modern Macs |
| Free Apple Developer | ❌ No signing certificates |
| Third-party services | Requires trust + still costs |
| Homebrew | ❌ Requires signed apps |

The only reliable solution is **Apple Developer Program** ($99/year) for Developer ID + notarization. This is an industry requirement for all macOS apps distributed outside the App Store.

For now, the **right-click > Open** workaround works perfectly!

## Privacy

✅ **100% Local-First**: All your data stays on your computer
✅ **Works Offline**: No internet required after installation
✅ **No Cloud**: Nothing is sent to external servers

---

**Need Help?** 
[Open an issue](https://github.com/Sensible-Analytics/SensibleDB/issues) or email founders@sensibledb-db.com