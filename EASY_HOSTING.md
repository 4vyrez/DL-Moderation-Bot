# Easiest Ways to Host Your Bot

Since the Oracle Cloud method was too complex, here are two **much easier** ways to host your bot.

## Option 1: Host Locally (Recommended & Easiest)
**Best for:** Beginners, full control, $0 cost.
**Requirement:** Your PC must be on for the bot to be online.

We valid use a tool called **PM2**. It runs your bot in the background, restarts it if it crashes, and starts it automatically when your PC turns on.

### Setup (I can do this for you!)
1.  **Open Terminal** in your project folder.
2.  **Install PM2**:
    ```powershell
    npm install pm2 -g
    ```
3.  **Start Your Bot**:
    ```powershell
    pm2 start src/index.js --name "DL-Bot"
    ```
4.  **Save List** (so it remembers):
    ```powershell
    pm2 save
    ```

**Managing the Bot:**
*   `pm2 list`: See status.
*   `pm2 logs DL-Bot`: View the console output.
*   `pm2 restart DL-Bot`: Restart after you edit code.
*   `pm2 stop DL-Bot`: Turn it off.

---

## Option 2: Koyeb (Easiest Cloud)
**Best for:** 24/7 uptime without your PC.
**Requirement:** GitHub account.

Koyeb is a modern cloud host. You don't need to manage a server; you just connect your GitHub.

1.  **Upload to GitHub**:
    *   Create a repository on [GitHub](https://github.com).
    *   Upload your bot code to it.
2.  **Sign up for Koyeb**:
    *   Go to [Koyeb.com](https://www.koyeb.com/) and sign in with GitHub.
3.  **Deploy**:
    *   Click **"Create App"**.
    *   Select **GitHub** as the source.
    *   Choose your bot's repository.
    *   Koyeb will detect it's a Node.js app.
    *   **Environment Variables**: You MUST add your secrets here!
        *   Click "Add Variable" for `DISCORD_TOKEN`, `CLIENT_ID`, etc.
    *   Click **"Deploy"**.

Your bot will now run 24/7 for free!
