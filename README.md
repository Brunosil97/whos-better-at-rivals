# Marvel Rivals Leaderboard 🏆

A stupid gimmick to settle the age-old question: **who's actually better at Marvel Rivals?**

## What is this?

This is a leaderboard web app built to track and compare Marvel Rivals stats between friends. Because sometimes you just need cold, hard data to prove who's carrying and who's getting carried.

## Features

- **Overall Rankings** - Point-based system across Win Rate, KDA, MVPs, SVPs, and Rank
- **Stat Leaders** - See who dominates in each category
- **Player Cards** - Detailed stats for each player including heroes, matches, and playtime
- **Live Rank Display** - Current season ranks from API
- **Auto-refresh** - Stats cached for 12 hours then auto-updated

## Tech Stack

- Vue 3 (Composition API)
- TypeScript
- Vuetify 3
- Pinia (State Management)
- IndexedDB (Caching)
- Marvel Rivals API

## Development

```bash
# Install dependencies
yarn install

# Run dev server
yarn dev

# Build for production
yarn build

# Deploy to GitHub Pages
yarn deploy
```

## Setup

1. Get an API key from [marvelrivalsapi.com](https://marvelrivalsapi.com)
2. Create a `.env` file:
   ```
   VITE_API_KEY=your_api_key_here
   ```
3. Add player UIDs to `docs/usernames.json` (format: `[{"uid": "player_id", "name": "PlayerName"}]`)

## Disclaimer

This app is purely for friendly competition and bragging rights. Stats are pulled from the Marvel Rivals API and cached locally. Any salt generated from viewing this leaderboard is purely intentional.
