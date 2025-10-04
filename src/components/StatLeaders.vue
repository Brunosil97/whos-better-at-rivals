<template>
  <div>
    <v-card class="mb-4" color="surface-variant" elevation="4" rounded="lg">
      <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center py-4">
        <v-icon class="mr-2" color="amber-accent-3" icon="mdi-trophy-variant" size="24" />
        Stat Leaders
      </v-card-title>
    </v-card>

    <div v-if="leaders" class="stat-leaders">
      <v-card
        v-for="(leader, key) in leaderCards"
        :key="key"
        class="mb-3 leader-card"
        elevation="4"
        rounded="lg"
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-3" :color="leader.chipColor" :icon="leader.icon" size="24" />
            <div class="flex-grow-1">
              <div class="text-caption text-medium-emphasis mb-1">
                {{ leader.title }}
              </div>
              <div class="text-body-2 font-weight-bold">
                {{ leader.player.data.name }}
              </div>
            </div>

            <v-chip
              class="font-weight-bold"
              :color="leader.chipColor"
              size="small"
              variant="flat"
            >
              {{ leader.value }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { usePlayersStore } from '@/stores/players'

  const playersStore = usePlayersStore()

  const leaders = computed(() => playersStore.statLeaders)

  function formatPlaytime (seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const leaderCards = computed(() => {
    if (!leaders.value) return []

    return [
      {
        key: 'highestWinRate',
        player: leaders.value.highestWinRate,
        title: 'Best Win Rate',
        value: `${leaders.value.highestWinRate.stats.winRate.toFixed(1)}%`,
        icon: 'mdi-chart-line',
        cardClass: 'win-rate-card',
        chipColor: 'green-lighten-1',
        accentColor: '#66BB6A',
        medalIcon: 'mdi-medal',
        medalColor: 'amber-accent-3',
      },
      {
        key: 'highestKDA',
        player: leaders.value.highestKDA,
        title: 'Highest KDA',
        value: leaders.value.highestKDA.stats.kda.toFixed(2),
        icon: 'mdi-sword-cross',
        cardClass: 'kda-card',
        chipColor: 'purple-lighten-1',
        accentColor: '#AB47BC',
        medalIcon: 'mdi-medal',
        medalColor: 'amber-accent-3',
      },
      {
        key: 'mostKills',
        player: leaders.value.mostKills,
        title: 'Most Kills',
        value: leaders.value.mostKills.stats.totalKills.toLocaleString(),
        icon: 'mdi-crosshairs',
        cardClass: 'kills-card',
        chipColor: 'deep-orange-lighten-1',
        accentColor: '#FF7043',
        medalIcon: 'mdi-fire',
        medalColor: 'deep-orange-accent-3',
      },
      {
        key: 'mostMVPs',
        player: leaders.value.mostMVPs,
        title: 'Most MVPs',
        value: leaders.value.mostMVPs.stats.totalMVP.toString(),
        icon: 'mdi-trophy',
        cardClass: 'mvp-card',
        chipColor: 'amber-lighten-1',
        accentColor: '#FFCA28',
        medalIcon: 'mdi-trophy-variant',
        medalColor: 'amber-accent-3',
      },
      {
        key: 'mostSVPs',
        player: leaders.value.mostSVPs,
        title: 'Most SVPs',
        value: leaders.value.mostSVPs.stats.totalSVP.toString(),
        icon: 'mdi-star-circle',
        cardClass: 'svp-card',
        chipColor: 'cyan-lighten-1',
        accentColor: '#26C6DA',
        medalIcon: 'mdi-star',
        medalColor: 'cyan-accent-3',
      },
      {
        key: 'mostPlaytime',
        player: leaders.value.mostPlaytime,
        title: 'Most Playtime',
        value: formatPlaytime(leaders.value.mostPlaytime.stats.playtime),
        icon: 'mdi-clock-outline',
        cardClass: 'playtime-card',
        chipColor: 'grey-lighten-1',
        accentColor: '#BDBDBD',
        medalIcon: 'mdi-clock-star-four-points',
        medalColor: 'grey-lighten-1',
      },
    ]
  })
</script>

<style scoped>
.stat-leaders {
  position: sticky;
  top: 24px;
}

.leader-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(10px);
}

.leader-card:hover {
  transform: translateX(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
}

.avatar-border {
  transition: transform 0.3s ease;
}

.leader-card:hover .avatar-border {
  transform: scale(1.1);
}

.medal-icon {
  opacity: 0.9;
  transition: all 0.3s ease;
}

.leader-card:hover .medal-icon {
  opacity: 1;
  transform: rotate(10deg) scale(1.1);
}

.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
