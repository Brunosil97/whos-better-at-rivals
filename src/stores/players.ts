import { defineStore } from 'pinia'
import { fetchPlayerStats, type PlayerStats } from '@/services/api'
import { getCachedPlayer, setCachedPlayer } from '@/services/cache'
import usernames from '../../docs/usernames.json'

interface PlayerWithProgress {
  uid: string
  name: string
  data: PlayerStats | null
  loading: boolean
  error: string | null
}

export interface PlayerStatsData {
  [key: string]: number | string | PlayerStats['heroes_ranked'] | undefined
  winRate: number
  kd: number
  kda: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  rankScore: number
  rankLevel: number
  totalKills: number
  totalAssists: number
  totalDeaths: number
  totalMatches: number
  totalWins: number
  totalMVP: number
  totalSVP: number
  playtime: number
  playtimeFormatted: string
  topHeroes: PlayerStats['heroes_ranked']
}

export type PlayerWithStats = Omit<PlayerWithProgress, 'data'> & {
  data: PlayerStats
  stats: PlayerStatsData
}

export const usePlayersStore = defineStore('players', {
  state: () => ({
    players: usernames.map(user => ({
      uid: user.uid,
      name: user.name,
      data: null,
      loading: false,
      error: null,
    })) as PlayerWithProgress[],
    isLoading: false,
    loadProgress: 0,
    loadedCount: 0,
  }),

  getters: {
    totalPlayers: state => state.players.length,
    loadedPlayers: state => state.players.filter(p => p.data !== null).length,
    hasErrors: state => state.players.some(p => p.error !== null),
    allPlayersLoaded: state => state.players.every(p => p.data !== null || p.error !== null),

    // Calculate stats for each player
    playersWithStats: (state): PlayerWithStats[] => {
      return state.players
        .filter(p => p.data !== null)
        .map(p => {
          const ranked = p.data!.overall_stats.ranked

          // Convert rank to numeric level for comparison
          // Rank order: Bronze < Silver < Gold < Diamond < Platinum < Grandmaster < Eternity < One Above All
          // Within a tier: III < II < I (so Platinum I > Platinum II > Platinum III)
          const rankMap: Record<string, number> = {
            'Bronze III': 1, 'Bronze II': 2, 'Bronze I': 3,
            'Silver III': 4, 'Silver II': 5, 'Silver I': 6,
            'Gold III': 7, 'Gold II': 8, 'Gold I': 9,
            'Diamond III': 10, 'Diamond II': 11, 'Diamond I': 12,
            'Platinum III': 13, 'Platinum II': 14, 'Platinum I': 15,
            'Grandmaster III': 16, 'Grandmaster II': 17, 'Grandmaster I': 18,
            'Eternity': 19, 'One Above All': 20,
          }
          const rankLevel = rankMap[p.data!.player.rank.rank] || 0
          const rankScore = 0

          // Calculate stats
          const winRate = ranked.total_matches > 0
            ? (ranked.total_wins / ranked.total_matches) * 100
            : 0

          const kd = ranked.total_deaths > 0
            ? ranked.total_kills / ranked.total_deaths
            : ranked.total_kills

          const kda = ranked.total_deaths > 0
            ? (ranked.total_kills + ranked.total_assists) / ranked.total_deaths
            : ranked.total_kills + ranked.total_assists

          const avgKills = ranked.total_matches > 0
            ? ranked.total_kills / ranked.total_matches
            : 0

          const avgDeaths = ranked.total_matches > 0
            ? ranked.total_deaths / ranked.total_matches
            : 0

          const avgAssists = ranked.total_matches > 0
            ? ranked.total_assists / ranked.total_matches
            : 0

          // Get top 5 heroes
          const topHeroes = [...(p.data!.heroes_ranked || [])]
            .toSorted((a, b) => b.matches - a.matches)
            .slice(0, 5)

          return {
            uid: p.uid,
            name: p.name,
            data: p.data!,
            loading: p.loading,
            error: p.error,
            stats: {
              winRate,
              kd,
              kda,
              avgKills,
              avgDeaths,
              avgAssists,
              rankScore,
              rankLevel,
              totalKills: ranked.total_kills,
              totalAssists: ranked.total_assists,
              totalDeaths: ranked.total_deaths,
              totalMatches: ranked.total_matches,
              totalWins: ranked.total_wins,
              totalMVP: ranked.total_mvp,
              totalSVP: ranked.total_svp,
              playtime: ranked.total_time_played_raw,
              playtimeFormatted: ranked.total_time_played,
              topHeroes,
            },
          }
        })
    },

    // Find stat leaders
    statLeaders (): { highestWinRate: PlayerWithStats, highestKDA: PlayerWithStats, mostKills: PlayerWithStats, mostMVPs: PlayerWithStats, mostSVPs: PlayerWithStats, mostPlaytime: PlayerWithStats } | null {
      const players = this.playersWithStats
      if (players.length === 0) {
        return null
      }

      return {
        highestWinRate: players.reduce((max, p) => p.stats.winRate > max.stats.winRate ? p : max),
        highestKDA: players.reduce((max, p) => p.stats.kda > max.stats.kda ? p : max),
        mostKills: players.reduce((max, p) => p.stats.totalKills > max.stats.totalKills ? p : max),
        mostMVPs: players.reduce((max, p) => p.stats.totalMVP > max.stats.totalMVP ? p : max),
        mostSVPs: players.reduce((max, p) => p.stats.totalSVP > max.stats.totalSVP ? p : max),
        mostPlaytime: players.reduce((max, p) => p.stats.playtime > max.stats.playtime ? p : max),
      }
    },

    // Calculate overall ranking based on points from stat leaders
    overallRanking (): Array<{ player: PlayerWithStats, totalPoints: number, breakdown: Record<string, number> }> {
      const players = this.playersWithStats
      if (players.length === 0) {
        return []
      }

      // Define stat categories to rank by (excluding playtime, K/D, Kills, and Assists)
      // K/D excluded as it fluctuates based on class
      // Kills excluded as KDA already measures lethality
      // Assists excluded as KDA already measures effectiveness including assists
      const statCategories = [
        { key: 'winRate' as const, name: 'Win Rate' },
        { key: 'kda' as const, name: 'KDA' },
        { key: 'totalMVP' as const, name: 'MVPs' },
        { key: 'totalSVP' as const, name: 'SVPs' },
        { key: 'rankLevel' as const, name: 'Rank' },
      ]

      // Calculate points for each player
      const playerPoints = players.map(player => {
        let totalPoints = 0
        const breakdown: Record<string, number> = {}

        for (const category of statCategories) {
          // Sort players by this stat (descending)
          const sorted = [...players].toSorted((a, b) =>
            b.stats[category.key] - a.stats[category.key],
          )

          // Get current player's stat value
          const playerValue = player.stats[category.key]

          // Count how many players have a BETTER stat (higher value)
          const betterCount = sorted.filter(p => p.stats[category.key] > playerValue).length

          // Award points based on position, handling ties
          // Players with same value get same points
          let points = 0
          switch (betterCount) {
            case 0: {
              points = 4

              break
            }
            case 1: {
              points = 3

              break
            }
            case 2: {
              points = 2

              break
            }
            case 3: {
              points = 1

              break
            }
          // No default
          }

          totalPoints += points
          breakdown[category.name] = points
        }

        return {
          player,
          totalPoints,
          breakdown,
        }
      })

      // Sort by total points descending
      return playerPoints.toSorted((a, b) => b.totalPoints - a.totalPoints)
    },

    // Get players sorted by a specific stat
    sortedPlayers (): (sortBy: string) => PlayerWithStats[] {
      return (sortBy: string) => {
        const players = [...this.playersWithStats]

        const sortFunctions: Record<string, (a: PlayerWithStats, b: PlayerWithStats) => number> = {
          overall: () => 0, // Will use overallRanking getter instead
          rank: (a, b) => b.stats.rankLevel - a.stats.rankLevel,
          winRate: (a, b) => b.stats.winRate - a.stats.winRate,
          kd: (a, b) => b.stats.kd - a.stats.kd,
          kda: (a, b) => b.stats.kda - a.stats.kda,
          kills: (a, b) => b.stats.totalKills - a.stats.totalKills,
          matches: (a, b) => b.stats.totalMatches - a.stats.totalMatches,
        }

        // If sorting by overall, return the overallRanking mapped to players
        if (sortBy === 'overall') {
          return this.overallRanking.map(item => item.player)
        }

        return players.toSorted(sortFunctions[sortBy] || sortFunctions.rank)
      }
    },
  },

  actions: {
    updateProgress () {
      this.loadedCount++
      this.loadProgress = (this.loadedCount / this.players.length) * 100
    },

    async fetchAllPlayers () {
      this.isLoading = true
      this.loadProgress = 0
      this.loadedCount = 0

      const promises = this.players.map(async player => {
        player.loading = true
        player.error = null

        try {
          // Check cache first
          const cachedData = await getCachedPlayer(player.uid)

          if (cachedData) {
            player.data = cachedData
            this.updateProgress()
          } else {
            // Fetch from API if not cached
            const data = await fetchPlayerStats(player.uid)
            player.data = data

            // Cache the result
            await setCachedPlayer(player.uid, data)
            this.updateProgress()
          }
        } catch (error) {
          player.error = error instanceof Error ? error.message : 'Failed to load player data'
          this.updateProgress()
        } finally {
          player.loading = false
        }
      })

      await Promise.all(promises)
      this.isLoading = false
    },
  },
})
