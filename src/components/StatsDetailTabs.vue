<template>
  <v-card class="mt-6 detail-tabs-card" elevation="6" rounded="lg">
    <v-tabs
      v-model="tab"
      bg-color="surface-variant"
      color="primary"
      :grow="!mobile"
      :height="mobile ? 56 : 64"
      :density="mobile ? 'compact' : 'default'"
      show-arrows
    >
      <v-tab class="text-none font-weight-medium" :class="{ 'px-2': mobile }" value="all">
        <v-icon :icon="mobile ? 'mdi-chart-bar' : 'mdi-chart-bar'" :size="mobile ? 'default' : 'large'" :start="!mobile" />
        <span v-if="!mobile">All Stats</span>
      </v-tab>
      <v-tab class="text-none font-weight-medium" :class="{ 'px-2': mobile }" value="heroes">
        <v-icon :icon="mobile ? 'mdi-account-multiple' : 'mdi-account-multiple'" :size="mobile ? 'default' : 'large'" :start="!mobile" />
        <span v-if="!mobile">Heroes</span>
      </v-tab>
      <v-tab class="text-none font-weight-medium" :class="{ 'px-2': mobile }" value="maps">
        <v-icon :icon="mobile ? 'mdi-map' : 'mdi-map'" :size="mobile ? 'default' : 'large'" :start="!mobile" />
        <span v-if="!mobile">Maps</span>
      </v-tab>
      <v-tab class="text-none font-weight-medium" :class="{ 'px-2': mobile }" value="recent">
        <v-icon :icon="mobile ? 'mdi-history' : 'mdi-history'" :size="mobile ? 'default' : 'large'" :start="!mobile" />
        <span v-if="!mobile">Recent</span>
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <!-- All Stats Tab -->
      <v-window-item value="all">
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="players"
            :mobile="mobile"
            item-value="uid"
          >
            <template #item.player="{ item }">
              <div class="d-flex align-center">
                <v-avatar class="mr-2" size="32" color="surface-variant">
                  <v-img
                    :alt="item.name"
                    :src="`https://marvelrivalsapi.com${item.data?.player.icon.player_icon}`"
                  >
                    <template #error>
                      <v-icon icon="mdi-account-circle" size="24" />
                    </template>
                  </v-img>
                </v-avatar>
                <span class="font-weight-medium">{{ item.data?.name }}</span>
              </div>
            </template>

            <template #item.stats.winRate="{ item }">
              <v-chip :color="getWinRateColor(item.stats.winRate)" size="small">
                {{ item.stats.winRate.toFixed(1) }}%
              </v-chip>
            </template>

            <template #item.stats.kd="{ item }">
              {{ item.stats.kd.toFixed(2) }}
            </template>

            <template #item.stats.kda="{ item }">
              {{ item.stats.kda.toFixed(2) }}
            </template>

            <template #item.stats.totalKills="{ item }">
              {{ item.stats.totalKills }}
            </template>

            <template #item.stats.totalAssists="{ item }">
              {{ item.stats.totalAssists }}
            </template>

            <template #item.stats.totalMVP="{ item }">
              <div class="d-flex align-center justify-center">
                <v-icon color="amber" icon="mdi-trophy" size="small" />
                <span class="ml-1">{{ item.stats.totalMVP }}</span>
              </div>
            </template>

            <template #item.stats.totalSVP="{ item }">
              <div class="d-flex align-center justify-center">
                <v-icon color="blue" icon="mdi-star" size="small" />
                <span class="ml-1">{{ item.stats.totalSVP }}</span>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-window-item>

      <!-- Heroes Tab -->
      <v-window-item value="heroes">
        <v-card-text>
          <v-row>
            <v-col
              v-for="player in players"
              :key="player.uid"
              cols="12"
              md="6"
            >
              <v-card elevation="2" rounded="lg">
                <v-card-title class="d-flex align-center">
                  <v-avatar class="mr-2" size="40" color="surface-variant">
                    <v-img
                      :alt="player.name"
                      :src="`https://marvelrivalsapi.com${player.data?.player.icon.player_icon}`"
                    >
                      <template #error>
                        <v-icon icon="mdi-account-circle" size="32" />
                      </template>
                    </v-img>
                  </v-avatar>
                  {{ player.data?.name }}'s Heroes
                </v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item
                      v-for="hero in player.stats.topHeroes"
                      :key="hero.hero_id"
                      class="mb-2"
                    >
                      <template #prepend>
                        <v-avatar rounded="lg" size="40">
                          <v-img
                            v-if="hero.hero_thumbnail"
                            :alt="hero.hero_name"
                            :src="`https://marvelrivalsapi.com${hero.hero_thumbnail}`"
                          />
                          <v-icon v-else icon="mdi-account-question" />
                        </v-avatar>
                      </template>

                      <v-list-item-title class="text-capitalize">
                        {{ hero.hero_name }}
                      </v-list-item-title>

                      <v-list-item-subtitle>
                        {{ hero.matches }} matches • {{ ((hero.wins / hero.matches) * 100).toFixed(0) }}% WR
                        • {{ (hero.kills / hero.deaths).toFixed(2) }} K/D
                      </v-list-item-subtitle>

                      <template #append>
                        <v-chip
                          v-if="hero.mvp > 0"
                          class="mr-1"
                          color="amber"
                          size="x-small"
                        >
                          {{ hero.mvp }} MVP
                        </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-window-item>

      <!-- Maps Tab -->
      <v-window-item value="maps">
        <v-card-text>
          <v-row>
            <v-col
              v-for="player in players"
              :key="player.uid"
              cols="12"
              md="6"
            >
              <v-card elevation="2" rounded="lg">
                <v-card-title class="d-flex align-center">
                  <v-avatar class="mr-2" size="40" color="surface-variant">
                    <v-img
                      :alt="player.name"
                      :src="`https://marvelrivalsapi.com${player.data?.player.icon.player_icon}`"
                    >
                      <template #error>
                        <v-icon icon="mdi-account-circle" size="32" />
                      </template>
                    </v-img>
                  </v-avatar>
                  {{ player.data?.name }}'s Maps
                </v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item
                      v-for="map in getTopMaps(player)"
                      :key="map.map_id"
                      class="mb-2"
                    >
                      <template #prepend>
                        <v-avatar rounded="lg" size="40">
                          <v-img
                            :alt="`Map ${map.map_id}`"
                            :src="`https://marvelrivalsapi.com${map.map_thumbnail}`"
                          />
                        </v-avatar>
                      </template>

                      <v-list-item-title>
                        Map {{ map.map_id }}
                      </v-list-item-title>

                      <v-list-item-subtitle>
                        {{ map.matches }} matches • {{ ((map.wins / map.matches) * 100).toFixed(0) }}% WR
                        • {{ (map.kills / map.deaths).toFixed(2) }} K/D
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-window-item>

      <!-- Recent Tab -->
      <v-window-item value="recent">
        <v-card-text>
          <v-row>
            <v-col
              v-for="player in players"
              :key="player.uid"
              cols="12"
              md="6"
            >
              <v-card elevation="2" rounded="lg">
                <v-card-title class="d-flex align-center">
                  <v-avatar class="mr-2" size="40" color="surface-variant">
                    <v-img
                      :alt="player.name"
                      :src="`https://marvelrivalsapi.com${player.data?.player.icon.player_icon}`"
                    >
                      <template #error>
                        <v-icon icon="mdi-account-circle" size="32" />
                      </template>
                    </v-img>
                  </v-avatar>
                  {{ player.data?.name }}'s Recent Matches
                </v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item
                      v-for="match in getRecentMatches(player)"
                      :key="match.match_uid"
                      class="mb-2"
                      :class="{ 'bg-green-darken-4': match.player_performance.is_win.is_win, 'bg-red-darken-4': !match.player_performance.is_win.is_win }"
                    >
                      <template #prepend>
                        <v-icon
                          :color="match.player_performance.is_win.is_win ? 'success' : 'error'"
                          :icon="match.player_performance.is_win.is_win ? 'mdi-check-circle' : 'mdi-close-circle'"
                          size="large"
                        />
                      </template>

                      <v-list-item-title class="text-capitalize">
                        {{ match.player_performance.hero_name }}
                      </v-list-item-title>

                      <v-list-item-subtitle>
                        {{ match.player_performance.kills }}/{{ match.player_performance.deaths }}/{{ match.player_performance.assists }}
                        • {{ ((match.player_performance.kills + match.player_performance.assists) / Math.max(match.player_performance.deaths, 1)).toFixed(2) }} KDA
                      </v-list-item-subtitle>

                      <template #append>
                        <v-chip :color="match.player_performance.is_win.is_win ? 'success' : 'error'" size="x-small">
                          {{ match.player_performance.is_win.is_win ? 'WIN' : 'LOSS' }}
                        </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useDisplay } from 'vuetify'
  import { usePlayersStore, type PlayerWithStats } from '@/stores/players'

  const playersStore = usePlayersStore()
  const tab = ref('all')
  const { mobile } = useDisplay()

  const players = computed(() => playersStore.playersWithStats)

  const headers = [
    { title: 'Player', key: 'player', align: 'start' as const, sortable: false },
    { title: 'Win Rate', key: 'stats.winRate', align: 'center' as const },
    { title: 'K/D', key: 'stats.kd', align: 'center' as const },
    { title: 'KDA', key: 'stats.kda', align: 'center' as const },
    { title: 'Kills', key: 'stats.totalKills', align: 'center' as const },
    { title: 'Assists', key: 'stats.totalAssists', align: 'center' as const },
    { title: 'MVP', key: 'stats.totalMVP', align: 'center' as const },
    { title: 'SVP', key: 'stats.totalSVP', align: 'center' as const },
  ]

  function getWinRateColor (winRate: number) {
    if (winRate >= 60) return 'success'
    if (winRate >= 50) return 'primary'
    if (winRate >= 40) return 'warning'
    return 'error'
  }

  function getTopMaps (player: PlayerWithStats) {
    return [...(player.data?.maps || [])]
      .toSorted((a, b) => b.matches - a.matches)
      .slice(0, 5)
  }

  function getRecentMatches (player: PlayerWithStats) {
    return (player.data?.match_history || []).slice(0, 10)
  }
</script>

<style scoped>
.detail-tabs-card {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(20px);
}
</style>
