<template>
  <v-card class="mt-6 detail-tabs-card" elevation="6" rounded="lg">
    <v-tabs
      v-model="tab"
      bg-color="surface-variant"
      color="primary"
      grow
      height="64"
    >
      <v-tab class="text-none font-weight-medium" value="all">
        <v-icon icon="mdi-chart-bar" size="large" start />
        All Stats
      </v-tab>
      <v-tab class="text-none font-weight-medium" value="heroes">
        <v-icon icon="mdi-account-multiple" size="large" start />
        Heroes
      </v-tab>
      <v-tab class="text-none font-weight-medium" value="maps">
        <v-icon icon="mdi-map" size="large" start />
        Maps
      </v-tab>
      <v-tab class="text-none font-weight-medium" value="recent">
        <v-icon icon="mdi-history" size="large" start />
        Recent
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <!-- All Stats Tab -->
      <v-window-item value="all">
        <v-card-text>
          <v-table>
            <thead>
              <tr>
                <th>Player</th>
                <th class="text-center">Win Rate</th>
                <th class="text-center">K/D</th>
                <th class="text-center">KDA</th>
                <th class="text-center">Kills</th>
                <th class="text-center">Assists</th>
                <th class="text-center">MVP</th>
                <th class="text-center">SVP</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="player in players" :key="player.uid">
                <td>
                  <div class="d-flex align-center">
                    <v-avatar class="mr-2" size="32">
                      <v-img
                        :alt="player.name"
                        :src="`https://marvelrivalsapi.com${player.data?.player.icon.player_icon}`"
                      />
                    </v-avatar>
                    <span class="font-weight-medium">{{ player.data?.name }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <v-chip :color="getWinRateColor(player.stats.winRate)" size="small">
                    {{ player.stats.winRate.toFixed(1) }}%
                  </v-chip>
                </td>
                <td class="text-center">{{ player.stats.kd.toFixed(2) }}</td>
                <td class="text-center">{{ player.stats.kda.toFixed(2) }}</td>
                <td class="text-center">{{ player.stats.totalKills }}</td>
                <td class="text-center">{{ player.stats.totalAssists }}</td>
                <td class="text-center">
                  <v-icon color="amber" icon="mdi-trophy" size="small" />
                  {{ player.stats.totalMVP }}
                </td>
                <td class="text-center">
                  <v-icon color="blue" icon="mdi-star" size="small" />
                  {{ player.stats.totalSVP }}
                </td>
              </tr>
            </tbody>
          </v-table>
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
                  <v-avatar class="mr-2" size="40">
                    <v-img
                      :alt="player.name"
                      :src="`https://marvelrivalsapi.com${player.data?.player.icon.player_icon}`"
                    />
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
                  <v-avatar class="mr-2" size="40">
                    <v-img
                      :alt="player.name"
                      :src="`https://marvelrivalsapi.com${player.data?.player.icon.player_icon}`"
                    />
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
                  <v-avatar class="mr-2" size="40">
                    <v-img
                      :alt="player.name"
                      :src="`https://marvelrivalsapi.com${player.data?.player.icon.player_icon}`"
                    />
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
  import { usePlayersStore, type PlayerWithStats } from '@/stores/players'

  const playersStore = usePlayersStore()
  const tab = ref('all')

  const players = computed(() => playersStore.playersWithStats)

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
