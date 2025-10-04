<template>
  <div>
    <v-card class="mb-6" color="surface-variant" elevation="4" rounded="lg">
      <v-card-title :class="mobile ? 'flex-column align-start' : 'd-flex align-center justify-space-between'" class="py-3">
        <span class="text-subtitle-1 font-weight-bold" :class="{ 'mb-2': mobile }">
          <v-icon class="mr-2" color="primary" icon="mdi-podium" size="20" />
          Player Rankings
        </span>
        <v-chip-group
          v-model="sortBy"
          color="primary"
          mandatory
          selected-class="bg-primary"
          :class="{ 'overflow-x-auto': mobile }"
        >
          <v-chip :size="mobile ? 'x-small' : 'small'" value="overall" variant="flat">Overall</v-chip>
          <v-chip :size="mobile ? 'x-small' : 'small'" value="rank" variant="flat">Rank</v-chip>
          <v-chip :size="mobile ? 'x-small' : 'small'" value="winRate" variant="flat">Win %</v-chip>
          <v-chip :size="mobile ? 'x-small' : 'small'" value="kd" variant="flat">K/D</v-chip>
          <v-chip :size="mobile ? 'x-small' : 'small'" value="kda" variant="flat">KDA</v-chip>
          <v-chip :size="mobile ? 'x-small' : 'small'" value="kills" variant="flat">Kills</v-chip>
        </v-chip-group>
      </v-card-title>
    </v-card>

    <!-- Overall Ranking Info Card -->
    <v-card
      v-if="sortBy === 'overall'"
      class="mb-6"
      color="primary-darken-1"
      elevation="4"
      rounded="lg"
    >
      <v-card-text class="pa-4">
        <div class="d-flex align-center gap-3">
          <v-icon color="amber" icon="mdi-trophy-variant" size="24" />
          <div class="flex-grow-1">
            <div class="text-subtitle-2 font-weight-bold">Overall Ranking</div>
            <div class="text-caption">
              Points: 1st=4 • 2nd=3 • 3rd=2 • 4th=1 across Win Rate, KDA, MVPs, SVPs, Rank
            </div>
            <div class="text-caption mt-2 pa-2" style="background: rgba(0,0,0,0.2); border-radius: 4px;">
              <v-icon class="mr-1" icon="mdi-information" size="14" />
              <strong>KDA (Kills/Deaths/Assists):</strong> Measures effectiveness and lethality by calculating (Kills + Assists) ÷ Deaths. Higher KDA = better performance.
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col
        v-for="(player, index) in sortedPlayers"
        :key="player.uid"
        cols="12"
        lg="6"
        md="6"
      >
        <v-card
          class="player-card"
          :class="{
            'first-place': index === 0
          }"
          :elevation="index === 0 ? 16 : 6"
          rounded="xl"
        >
          <v-card-text class="pb-0">
            <div class="d-flex align-center mb-4">
              <div class="position-relative mr-4">
                <v-avatar
                  size="80"
                  :style="getRankBorderStyle(player)"
                  color="grey-darken-2"
                >
                  <v-img
                    :alt="player.name"
                    :src="`https://marvelrivalsapi.com${player.data.player.icon.player_icon}`"
                  >
                    <template #error>
                      <div class="d-flex align-center justify-center h-100">
                        <v-icon icon="mdi-account-circle" size="60" color="grey-lighten-1" />
                      </div>
                    </template>
                  </v-img>
                </v-avatar>
                <v-avatar
                  class="position-absolute"
                  :color="getPositionColor(getPosition(index).position - 1)"
                  size="32"
                  style="bottom: -4px; right: -4px; border: 2px solid white;"
                >
                  <span class="text-white font-weight-bold text-caption">{{ getPosition(index).position }}</span>
                </v-avatar>
              </div>

              <div class="flex-grow-1">
                <h2 class="text-h5 font-weight-bold mb-1">
                  {{ player.data.name }}
                </h2>
                <div class="d-flex align-center gap-2 mb-2">
                  <v-chip
                    prepend-icon="mdi-star"
                    size="small"
                  >
                    Lvl {{ player.data.player.level }}
                  </v-chip>
                  <v-chip
                    class="text-white"
                    size="small"
                    :style="{ backgroundColor: player.data.player.rank.color || '#666' }"
                  >
                    {{ player.data.player.rank.rank }}
                  </v-chip>
                </div>
                <!-- Overall Points Display -->
                <div v-if="sortBy === 'overall' && getPlayerPoints(player.uid)" class="mt-2">
                  <v-chip
                    class="font-weight-bold"
                    color="amber-accent-3"
                    prepend-icon="mdi-trophy-variant"
                    size="small"
                  >
                    {{ getPlayerPoints(player.uid)?.totalPoints }} Points
                  </v-chip>
                </div>
              </div>
            </div>

            <v-divider class="mb-4" />

            <v-row class="mb-2" dense>
              <v-col cols="6">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-primary">
                    {{ player.stats.winRate.toFixed(1) }}%
                  </div>
                  <div class="text-caption text-medium-emphasis">Win Rate</div>
                  <v-progress-linear
                    class="mt-1"
                    color="primary"
                    height="4"
                    :model-value="player.stats.winRate"
                    rounded
                  />
                </div>
              </v-col>
              <v-col cols="3">
                <div class="text-center">
                  <div class="text-h5 font-weight-bold">
                    {{ player.stats.kd.toFixed(2) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">K/D</div>
                </div>
              </v-col>
              <v-col cols="3">
                <div class="text-center">
                  <div class="text-h5 font-weight-bold">
                    {{ player.stats.kda.toFixed(2) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">KDA</div>
                </div>
              </v-col>
            </v-row>

            <v-row class="mb-2" dense>
              <v-col cols="3">
                <div class="text-center">
                  <div class="text-body-1 font-weight-medium">
                    {{ player.stats.totalKills }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Kills</div>
                </div>
              </v-col>
              <v-col cols="3">
                <div class="text-center">
                  <div class="text-body-1 font-weight-medium">
                    {{ player.stats.totalAssists }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Assists</div>
                </div>
              </v-col>
              <v-col cols="3">
                <div class="text-center">
                  <div class="text-body-1 font-weight-medium">
                    {{ player.stats.totalDeaths }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Deaths</div>
                </div>
              </v-col>
              <v-col cols="3">
                <div class="text-center">
                  <div class="text-body-1 font-weight-medium">
                    {{ player.stats.totalMatches }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Matches</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <!-- Overall Points Breakdown -->
          <v-card-text v-if="sortBy === 'overall' && getPlayerPoints(player.uid)" class="px-4 pt-0 pb-2">
            <v-divider class="mb-3" />
            <div class="text-caption text-medium-emphasis mb-2">Points Breakdown:</div>
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="(points, category) in getPlayerPoints(player.uid)?.breakdown"
                :key="category"
                :color="points === 4 ? 'amber' : points === 3 ? 'grey-lighten-1' : points === 2 ? 'deep-orange-lighten-1' : 'primary'"
                size="x-small"
                variant="flat"
              >
                {{ category }}: {{ points }}
              </v-chip>
            </div>
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-chip
              color="amber"
              prepend-icon="mdi-trophy"
              size="small"
              variant="tonal"
            >
              {{ player.stats.totalMVP }} MVP
            </v-chip>
            <v-chip
              color="blue"
              prepend-icon="mdi-star-circle"
              size="small"
              variant="tonal"
            >
              {{ player.stats.totalSVP }} SVP
            </v-chip>
            <v-spacer />
            <v-chip
              prepend-icon="mdi-clock-outline"
              size="small"
              variant="tonal"
            >
              {{ player.stats.playtimeFormatted }}
            </v-chip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useDisplay } from 'vuetify'
  import { usePlayersStore, type PlayerWithStats } from '@/stores/players'

  const playersStore = usePlayersStore()
  const sortBy = ref('overall')
  const { mobile } = useDisplay()

  const sortedPlayers = computed(() => {
    return playersStore.sortedPlayers(sortBy.value)
  })

  // Get overall ranking data with points
  const overallRankingData = computed(() => {
    return playersStore.overallRanking
  })

  // Get points for a specific player
  function getPlayerPoints (uid: string) {
    const ranking = overallRankingData.value.find(r => r.player.uid === uid)
    return ranking || null
  }

  // Get position with tie handling
  function getPosition (index: number) {
    const players = sortedPlayers.value
    const currentPlayer = players[index]

    if (!currentPlayer) {
      return { position: 0, isTied: false }
    }

    // Get the stat key based on current sort
    const statKeys: Record<string, string> = {
      rank: 'rankLevel',
      winRate: 'winRate',
      kd: 'kd',
      kda: 'kda',
      kills: 'totalKills',
      matches: 'totalMatches',
    }

    // For overall, use total points from overallRanking
    if (sortBy.value === 'overall') {
      const currentPoints = getPlayerPoints(currentPlayer.uid)?.totalPoints || 0

      // Get unique point values that are better than current
      const betterValues = new Set(
        players
          .map(p => getPlayerPoints(p.uid)?.totalPoints || 0)
          .filter(points => points > currentPoints),
      )

      const position = betterValues.size + 1
      const isTied = players.filter(p => {
        const pPoints = getPlayerPoints(p.uid)?.totalPoints || 0
        return pPoints === currentPoints
      }).length > 1

      return { position, isTied }
    }

    const statKey = statKeys[sortBy.value] || 'rankLevel'
    const currentValue = currentPlayer?.stats[statKey]

    if (currentValue === undefined) {
      return { position: 0, isTied: false }
    }

    // Get unique stat values that are better than current
    const betterValues = new Set(
      players
        .map(p => p.stats[statKey])
        .filter(value => typeof value === 'number' && typeof currentValue === 'number' && value > currentValue),
    )

    const position = betterValues.size + 1

    // Check if tied (same stat value)
    const isTied = players.filter(p => p.stats[statKey] === currentValue).length > 1

    return { position, isTied }
  }

  function getPositionColor (index: number) {
    const colors = ['amber', 'grey-lighten-1', 'deep-orange-lighten-1']
    return colors[index] || 'primary'
  }

  function getRankBorderStyle (player: PlayerWithStats) {
    const rankColor = player.data.player.rank.color
    return rankColor && rankColor !== 'Invalid level'
      ? { border: `4px solid ${rankColor}`, boxShadow: `0 0 20px ${rankColor}40` }
      : { border: '4px solid #666' }
  }
</script>

<style scoped>
.player-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.player-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4) !important;
  border-color: rgba(255, 255, 255, 0.1);
}

.first-place {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(var(--v-theme-surface), 0.95) 100%);
  border: 2px solid rgba(255, 193, 7, 0.4);
  box-shadow: 0 0 30px rgba(255, 193, 7, 0.2);
}

.first-place:hover {
  border-color: rgba(255, 193, 7, 0.6);
  box-shadow: 0 0 40px rgba(255, 193, 7, 0.3) !important;
}
</style>
