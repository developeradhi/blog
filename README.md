# Adarsh B A - Developer Blog

Welcome to the source code for my personal engineering blog! 

This repository contains the frontend code for my technical blog, where I share deep dives into Full-Stack Development, System Architecture, Next.js, and modern web application patterns.

## Tech Stack

This blog is designed for maximum performance, SEO, and developer experience:
- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Styling:** Tailwind CSS (v4)
- **Deployment:** GitHub Pages (Static HTML Export)
- **Design:** Custom Dark Mode Glassmorphism UI
- **Typography:** Plus Jakarta Sans & Fira Code

## Architecture

To ensure lightning-fast page loads and zero hosting costs, this Next.js application is configured for **Static Export** (`output: 'export'`). 
A GitHub Actions workflow automatically builds the static HTML, CSS, and optimized assets on every push to the `main` branch and deploys them seamlessly to GitHub Pages.

## Getting Started Locally

If you want to run this project locally on your machine:

1. Clone the repository:
   ```bash
   git clone https://github.com/developeradhi/blog.git
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Security & Privacy
This repository contains purely open-source frontend code. All sensitive backend logic, analytics tracking, and database operations are managed securely and are entirely decoupled from this static codebase. No API keys or secrets are exposed in this repository.

---
*Built with ❤️ by Adarsh B A.*
