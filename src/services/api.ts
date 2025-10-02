export interface PlayerStats {
  uid: number
  name: string
  updates: any
  player: {
    uid: number
    level: string
    name: string
    icon: {
      player_icon_id: string
      player_icon: string
    }
    rank: {
      rank: string
      image: string | null
      color: string | null
    }
    rank_game_season?: Record<string, {
      rank_game_id: number
      level: number
      rank_score: number
      max_level: number
      max_rank_score: number
      update_time: number
      win_count: number
      protect_score: number
      diff_score: number
    }>
    team?: any
    info?: {
      completed_achievements?: string
      login_os?: string
      rank_game_season?: Record<string, {
        rank_game_id: number
        level: number
        rank_score: number
        max_level: number
        max_rank_score: number
        update_time: number
        win_count: number
        protect_score: number
        diff_score: number
      }>
    }
  }
  isPrivate: boolean
  overall_stats: {
    total_matches: number
    total_wins: number
    unranked: {
      total_matches: number
      total_wins: number
      total_assists: number
      total_deaths: number
      total_kills: number
      total_time_played: string
      total_time_played_raw: number
      total_mvp: number
      total_svp: number
    }
    ranked: {
      total_matches: number
      total_wins: number
      total_assists: number
      total_deaths: number
      total_kills: number
      total_time_played: string
      total_time_played_raw: number
      total_mvp: number
      total_svp: number
    }
  }
  match_history?: any[]
  rank_history?: any[]
  hero_matchups?: any[]
  team_mates?: any[]
  heroes_ranked?: Array<{
    hero_id: number
    hero_name: string
    hero_thumbnail: string | null
    matches: number
    wins: number
    mvp: number
    svp: number
    kills: number
    deaths: number
    assists: number
    play_time: number
    damage: number
    heal: number
    damage_taken: number
    main_attack: {
      total: number
      hits: number
    }
  }>
  heroes_unranked?: any[]
  maps?: Array<{
    map_id: number
    map_thumbnail: string
    matches: number
    wins: number
    kills: number
    deaths: number
    assists: number
    play_time: number
  }>
}

const API_BASE_URL = 'https://marvelrivalsapi.com/api/v1'
const API_KEY = import.meta.env.VITE_API_KEY

export async function fetchPlayerStats (uid: string): Promise<PlayerStats> {
  const response = await fetch(`${API_BASE_URL}/player/${uid}`, {
    headers: {
      'x-api-key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch player stats: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

export async function updatePlayerStats (uid: string): Promise<PlayerStats> {
  const response = await fetch(`${API_BASE_URL}/player/${uid}/update`, {
    headers: {
      'x-api-key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to update player stats: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

const UPDATE_COOLDOWN = 30 * 60 * 1000 // 30 minutes in milliseconds

export function canUpdatePlayer (uid: string): boolean {
  const lastUpdate = localStorage.getItem(`player_update_${uid}`)
  if (!lastUpdate) {
    return true
  }

  const timeSinceUpdate = Date.now() - Number.parseInt(lastUpdate, 10)
  return timeSinceUpdate >= UPDATE_COOLDOWN
}

export function getTimeUntilNextUpdate (uid: string): number {
  const lastUpdate = localStorage.getItem(`player_update_${uid}`)
  if (!lastUpdate) {
    return 0
  }

  const timeSinceUpdate = Date.now() - Number.parseInt(lastUpdate, 10)
  const timeRemaining = UPDATE_COOLDOWN - timeSinceUpdate
  return Math.max(0, timeRemaining)
}

export function setPlayerUpdateTime (uid: string): void {
  localStorage.setItem(`player_update_${uid}`, Date.now().toString())
}
