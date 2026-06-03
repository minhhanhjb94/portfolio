# Minh Hanh Portfolio & Retro Game

A cinematic, warm Gryffindor-themed academic portfolio website with a retro platformer mini-game.

## How to Host on GitHub Pages (Chạy Web Trực Tuyến)

This repository is already structured and configured to run directly on **GitHub Pages** out of the box because:
1. The entry point is `index.html` located in the root directory.
2. All resources (CSS, JS, images) use **relative paths** (e.g. `styles.css` instead of `/styles.css`), ensuring they resolve correctly under GitHub Pages subfolders.

### Step-by-Step Deployment (Các bước chạy web trên GitHub Pages):

1. **Create a GitHub Repository**:
   - Go to [GitHub](https://github.com/) and create a new repository (e.g., `minh-hanh-portfolio`).

2. **Push the Files to GitHub**:
   - Initialize git in this folder, commit your files, and push them to your repository:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin <your-github-repo-url>
     git push -u origin main
     ```

3. **Enable GitHub Pages**:
   - In your GitHub repository, go to **Settings** (bánh răng).
   - Scroll down the left sidebar and click on **Pages**.
   - Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` (or `master`) and specify `/ (root)`.
   - Click **Save**.

4. **Access your Website**:
   - After 1-2 minutes, GitHub will give you a live link like: `https://<your-username>.github.io/<your-repo-name>/`
