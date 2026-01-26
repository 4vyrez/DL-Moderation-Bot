# Hosting Your Discord Bot on Oracle Cloud Always Free

This guide will walk you through setting up your Discord bot on Oracle Cloud's "Always Free" tier. We will use the **Ampere A1 Flex** instance type, which is incredibly powerful (4 CPUs, 24GB RAM) and completely free.

## Phase 1: Account & Instance Setup

1.  **Sign Up**: Go to the [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/) page and sign up.
    *   *Note: You will need a credit/debit card for identity verification, but you will not be charged unless you manually upgrade to a paid account.*
    *   **Region Selection**: Choose a "Home Region" close to you (e.g., US East Ashburn, UK London, etc.). **Important**: You cannot change this later, and the free ARM instances are sometimes "out of stock" in popular regions.

2.  **Create VM Instance**:
    *   Once logged in, look for **"Create a VM instance"** on the dashboard.
    *   **Name**: Give it a name like `discord-bot-server`.
    *   **Image**: Click "Change Image". Choose **Canonical Ubuntu** (latest version, e.g., 22.04 or 24.04).
    *   **Shape (Crucial Step)**:
        *   Click "Change Shape".
        *   Select **Ampere** (ARM).
        *   Checkbox **VM.Standard.A1.Flex**.
        *   Drag the sliders to the max free limit: **4 OCPUs** and **24 GB RAM**.
    *   **Networking**: Leave as default (Create new VCN).
    *   **Add SSH Keys**:
        *   Select **"Generate a key pair for me"**.
        *   **CLICK "SAVE PRIVATE KEY"**. This will download a `.key` file.
        *   **Do not lose this file.** You cannot access your server without it.
    *   Click **Create**.

3.  **Wait for Provisioning**:
    *   The instance status will turn big green **RUNNING**.
    *   Copy the **Public IP Address** shown on the right side.

## Phase 2: Connecting to Your Server (Windows)

1.  Move your downloaded private key (e.g., `ssh-key-2024-xxx.key`) to a safe folder (like `C:\Users\YourName\.ssh\`).
2.  Open **PowerShell** on your computer.
3.  Run the following command (replace the path and IP):
    ```powershell
    # If the key file permissions are an issue (common on Windows), you might simply try:
    ssh -i "path\to\your\private.key" ubuntu@YOUR_PUBLIC_IP
    ```
    *   *Example*: `ssh -i "C:\Users\Admin\.ssh\oracle.key" ubuntu@123.45.67.89`
4.  Type `yes` if asked about fingerprints.

## Phase 3: Server Environment Setup

Once connected (you see `ubuntu@instance-name:~$`), run these commands one by one to install the necessary tools.

1.  **Update the System**:
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

2.  **Install Node.js** (using NVM is best practice):
    ```bash
    # Install NVM (Node Version Manager)
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

    # Activate NVM (or close and reopen terminal)
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    # Install latest Node.js
    nvm install node
    ```

3.  **Install Git & PM2**:
    ```bash
    sudo apt install git -y
    npm install pm2 -g
    ```

## Phase 4: Deploying Your Bot

1.  **Clone Your Code**:
    *   Upload your bot code to GitHub (if you haven't already).
    *   Make the repo public (easiest) or set up a Personal Access Token for private repos.
    *   On the server:
        ```bash
        git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
        cd YOUR_REPO_NAME
        ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Secrets**:
    *   You need to create your `.env` file on the server.
    *   Run `nano .env`
    *   Paste your variables (Right-click usually pastes in SSH):
        ```text
        DISCORD_TOKEN=your_token_here
        CLIENT_ID=your_id
        # ... any other variables from your local .env
        ```
    *   Press `Ctrl+X`, then `Y`, then `Enter` to save.

4.  **Start with PM2**:
    ```bash
    pm2 start src/index.js --name "DL-Bot"
    ```

5.  **Enable Auto-Startup** (so it survives restarts):
    ```bash
    pm2 save
    pm2 startup
    ```
    *   *Copy and run the command that `pm2 startup` prints out.*

## Updating Your Bot Later

When you make changes on your PC:
1.  Push changes to GitHub: `git push`
2.  SSH into your server.
3.  Run:
    ```bash
    cd YOUR_REPO_NAME
    git pull
    npm install # (if you added new packages)
    pm2 restart DL-Bot
    ```
