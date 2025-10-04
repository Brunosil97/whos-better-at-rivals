<template>
  <v-container fluid class="px-4 px-md-6">
    <!-- Loading Screen -->
    <v-fade-transition>
      <div
        v-if="playersStore.isLoading"
        class="fill-height d-flex align-center justify-center"
        style="min-height: 100vh;"
      >
        <v-card
          class="pa-10"
          elevation="12"
          rounded="lg"
          width="600"
        >
          <div class="text-center mb-8">
            <v-icon
              class="mb-4"
              color="primary"
              icon="mdi-shield-account"
              size="64"
            />
            <h2 class="text-h4 font-weight-bold mb-2">Marvel Rivals</h2>
            <p class="text-subtitle-1 text-medium-emphasis">
              Loading Player Statistics
            </p>
          </div>

          <v-progress-linear
            class="mb-6"
            color="primary"
            height="32"
            :model-value="playersStore.loadProgress"
            rounded
            striped
          >
            <template #default>
              <strong class="text-h6">{{ Math.round(playersStore.loadProgress) }}%</strong>
            </template>
          </v-progress-linear>

          <div class="text-center text-body-2 text-medium-emphasis mb-6">
            {{ playersStore.loadedCount }} / {{ playersStore.totalPlayers }} players loaded
          </div>

          <v-list bg-color="transparent">
            <v-list-item
              v-for="player in playersStore.players"
              :key="player.uid"
              class="px-4 mb-1 rounded"
              :class="{ 'bg-success-darken-1': player.data, 'bg-error-darken-1': player.error }"
            >
              <template #prepend>
                <v-avatar :color="player.data ? 'success' : player.error ? 'error' : 'grey'" size="32">
                  <v-icon
                    v-if="player.data"
                    icon="mdi-check-bold"
                    size="20"
                  />
                  <v-progress-circular
                    v-else-if="player.loading"
                    indeterminate
                    size="20"
                    width="2"
                  />
                  <v-icon
                    v-else-if="player.error"
                    icon="mdi-close-thick"
                    size="20"
                  />
                  <v-icon v-else icon="mdi-account" size="20" />
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ player.name }}
              </v-list-item-title>

              <v-list-item-subtitle v-if="player.error" class="text-error-lighten-2">
                {{ player.error }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </div>
    </v-fade-transition>

    <!-- Leaderboard Content -->
    <v-fade-transition>
      <div v-if="!playersStore.isLoading && playersStore.allPlayersLoaded" class="py-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="mb-4">
            <v-icon
              class="header-icon"
              color="primary"
              icon="mdi-shield-star"
              size="80"
            />
          </div>
          <h1 class="text-h2 font-weight-bold mb-3 main-title">
            Marvel Rivals Leaderboard
          </h1>
          <v-chip
            class="px-6"
            color="primary"
            prepend-icon="mdi-trophy"
            size="large"
            variant="flat"
          >
            Season 8
          </v-chip>
        </div>

        <!-- Refresh Button -->
        <v-card class="mb-6" color="primary-darken-1" elevation="4" rounded="lg">
          <v-card-text :class="mobile ? 'pa-3' : 'pa-4'">
            <div class="d-flex align-center justify-space-between gap-4">
              <div class="flex-grow-1">
                <div :class="mobile ? 'text-caption' : 'text-subtitle-2'" class="font-weight-bold mb-1">Update Player Stats</div>
                <div class="text-caption" style="opacity: 0.9;">
                  <span v-if="!canRefresh">
                    Next refresh available in {{ formatTimeRemaining(timeUntilRefresh) }}
                  </span>
                  <span v-else>
                    Fetch latest data from API • 30 minute cooldown per player
                  </span>
                </div>
              </div>
              <v-btn
                v-if="!mobile"
                color="white"
                :disabled="isRefreshing || !canRefresh"
                :loading="isRefreshing"
                prepend-icon="mdi-refresh"
                size="large"
                variant="flat"
                @click="refreshAllPlayers"
              >
                Refresh
              </v-btn>
              <v-btn
                v-else
                color="white"
                :disabled="isRefreshing || !canRefresh"
                :loading="isRefreshing"
                icon="mdi-refresh"
                variant="flat"
                @click="refreshAllPlayers"
              />
            </div>
          </v-card-text>
        </v-card>

        <!-- Main Layout: Leaderboard + Stat Leaders -->
        <v-row>
          <v-col cols="12" lg="8">
            <LeaderboardCards />

            <!-- Detailed Stats Tabs -->
            <StatsDetailTabs />
          </v-col>

          <v-col cols="12" lg="4">
            <StatLeaders />
          </v-col>
        </v-row>
      </div>
    </v-fade-transition>
  </v-container>
</template>

<script lang="ts" setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useDisplay } from 'vuetify'
  import LeaderboardCards from '@/components/LeaderboardCards.vue'
  import StatLeaders from '@/components/StatLeaders.vue'
  import StatsDetailTabs from '@/components/StatsDetailTabs.vue'
  import { usePlayersStore } from '@/stores/players'
  import { updatePlayerStats, canUpdatePlayer, getTimeUntilNextUpdate, setPlayerUpdateTime } from '@/services/api'

  const playersStore = usePlayersStore()
  const { mobile } = useDisplay()
  const isRefreshing = ref(false)
  const canRefresh = ref(true)
  const timeUntilRefresh = ref(0)
  let refreshTimer: ReturnType<typeof setInterval> | null = null

  // Determine current season from the most recent match history
  const currentSeason = computed(() => {
    const players = playersStore.playersWithStats
    if (players.length === 0) return ''

    // Get the most recent match from any player
    let latestSeason = 0
    for (const player of players) {
      const matches = player.data?.match_history || []
      if (matches.length > 0 && matches[0].season) {
        latestSeason = Math.max(latestSeason, matches[0].season)
      }
    }

    return latestSeason > 0 ? latestSeason : ''
  })

  function updateRefreshStatus () {
    const allPlayers = playersStore.players
    if (allPlayers.length === 0) {
      canRefresh.value = true
      timeUntilRefresh.value = 0
      return
    }

    // Check if any player can be updated
    const canUpdateAny = allPlayers.some(p => canUpdatePlayer(p.uid))
    canRefresh.value = canUpdateAny

    // Get the minimum time until next update
    if (!canUpdateAny) {
      const times = allPlayers.map(p => getTimeUntilNextUpdate(p.uid))
      timeUntilRefresh.value = Math.min(...times)
    } else {
      timeUntilRefresh.value = 0
    }
  }

  async function refreshAllPlayers () {
    if (!canRefresh.value || isRefreshing.value) {
      return
    }

    isRefreshing.value = true

    try {
      // Update all players using the update endpoint
      for (const player of playersStore.players) {
        if (canUpdatePlayer(player.uid)) {
          try {
            await updatePlayerStats(player.uid)
            setPlayerUpdateTime(player.uid)
          } catch (error) {
            console.error(`Failed to update player ${player.name}:`, error)
          }
        }
      }

      // Refetch all players to get updated data
      await playersStore.fetchAllPlayers()

      updateRefreshStatus()
    } finally {
      isRefreshing.value = false
    }
  }

  function formatTimeRemaining (ms: number): string {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  onMounted(async () => {
    await playersStore.fetchAllPlayers()

    // Update refresh status
    updateRefreshStatus()

    // Update timer every second
    refreshTimer = setInterval(() => {
      updateRefreshStatus()
    }, 1000)
  })

  onUnmounted(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }
  })
</script>

<style scoped>
.header-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.main-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 3s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
