# Vocabulary Challenge Game

A React.js vocabulary learning web application that helps users learn English words by guessing them based on definitions.

## Features

- 🎯 Two game modes: Type the answer or Multiple choice
- 📚 Based on Oxford 5000 word list
- 🎚️ Multiple difficulty levels (A1-C2)
- 📊 Score tracking and streak system
- 📱 Responsive design for mobile and desktop
- 🔤 Smart word hiding in examples

## How to Deploy to GitHub Pages

### Prerequisites
- Node.js installed on your computer
- Git installed on your computer
- A GitHub account

### Step 1: Create a GitHub Repository
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" button and select "New repository"
3. Name your repository `vocabulary-game` (or any name you prefer)
4. Make sure it's set to **Public** (required for free GitHub Pages)
5. Click "Create repository"

### Step 2: Update package.json
1. Open `package.json` in your project
2. Update the `homepage` field with your GitHub username:
   ```json
   "homepage": "https://YOUR_GITHUB_USERNAME.github.io/vocabulary-game"
   ```
   Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username

### Step 3: Initialize Git and Push to GitHub
Run these commands in your project directory:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - Vocabulary Game"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/vocabulary-game.git

# Push to GitHub
git push -u origin main
```

### Step 4: Deploy to GitHub Pages
```bash
# Build and deploy to GitHub Pages
npm run deploy
```

### Step 5: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Select "gh-pages" branch
6. Click "Save"

Your app will be available at: `https://YOUR_GITHUB_USERNAME.github.io/vocabulary-game`

## Development

To run the app locally:

```bash
npm start
```

To build for production:

```bash
npm run build
```

## Technologies Used

- React 19
- TypeScript
- CSS3 with modern styling
- Oxford 5000 vocabulary dataset

## License

This project is open source and available under the MIT License.
