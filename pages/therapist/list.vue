<template>
  <view class="container" :style="appThemeStyle">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" :class="{ active: currentFilter === 'all' }" @click="onFilter('all')">全部</view>
      <view class="filter-item" :class="{ active: currentFilter === 'level' }" @click="onFilter('level')">等级</view>
      <view class="filter-item" :class="{ active: currentFilter === 'rating' }" @click="onFilter('rating')">评分最高</view>
      <view class="filter-item" :class="{ active: currentFilter === 'count' }" @click="onFilter('count')">服务最多</view>
    </view>

    <!-- 理疗师列表 -->
    <view class="therapist-list">
      <view v-for="item in list" :key="item.therapist_id" class="therapist-card" @click="onDetail(item.therapist_id)">
        <image :src="item.avatar_url || '/static/default-avatar.png'" mode="aspectFill" class="avatar" />
        <view class="info">
          <view class="name-row">
            <text class="name">{{ item.name }}</text>
            <text class="level-tag" :class="'level-' + item.level">{{ levelText[item.level] }}</text>
          </view>
          <text class="skill">{{ item.skill_summary || '专业按摩服务' }}</text>
          <view class="meta">
            <text class="rating">★ {{ item.total_rating }}</text>
            <text class="count">已服务{{ item.total_service_count }}次</text>
            <text class="years">从业{{ item.experience_years }}年</text>
          </view>
        </view>
        <view class="arrow">
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>
    </view>

    <empty v-if="!isLoading && list.length === 0" tips="暂无可用理疗师" />
  </view>
</template>

<script>
import * as TherapistApi from '@/api/therapist'

const levelText = { 1: '初级', 2: '中级', 3: '高级', 4: '专家' }

export default {
  data () {
    return {
      levelText,
      isLoading: true,
      list: [],
      currentFilter: 'all'
    }
  },
  onLoad () {
    this.loadList()
  },
  onPullDownRefresh () {
    this.loadList().then(() => uni.stopPullDownRefresh())
  },
  methods: {
    loadList () {
      this.isLoading = true
      const params = {}
      if (this.currentFilter === 'level') params.orderBy = 'level'
      if (this.currentFilter === 'rating') params.orderBy = 'rating'
      if (this.currentFilter === 'count') params.orderBy = 'count'
      return TherapistApi.list(params).then(res => {
        this.list = res.data.list.data || []
      }).finally(() => { this.isLoading = false })
    },
    onFilter (type) {
      this.currentFilter = type
      this.loadList()
    },
    onDetail (therapistId) {
      uni.navigateTo({ url: `/pages/therapist/detail?therapistId=${therapistId}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.container { min-height: 100vh; background: #f5f5f5; }
.filter-bar { display: flex; background: #fff; padding: 16rpx 24rpx; position: sticky; top: 0; z-index: 10; .filter-item { flex: 1; text-align: center; font-size: 26rpx; color: #666; &.active { color: #e8c269; font-weight: bold; } } }
.therapist-list { padding: 20rpx; }
.therapist-card { display: flex; background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; align-items: center;
  .avatar { width: 120rpx; height: 120rpx; border-radius: 60rpx; margin-right: 20rpx; }
  .info { flex: 1;
    .name-row { display: flex; align-items: center; margin-bottom: 8rpx; .name { font-size: 32rpx; font-weight: bold; margin-right: 12rpx; } .level-tag { font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 6rpx; &.level-1 { color: #52c41a; background: #f6ffed; } &.level-2 { color: #1890ff; background: #e6f7ff; } &.level-3 { color: #722ed1; background: #f9f0ff; } &.level-4 { color: #cf1322; background: #fff2f0; } } }
    .skill { font-size: 26rpx; color: #666; display: block; margin-bottom: 8rpx; }
    .meta { font-size: 24rpx; color: #999; .rating { color: #faad14; margin-right: 16rpx; } .count { margin-right: 16rpx; } }
  }
  .arrow { font-size: 28rpx; color: #ccc; }
}
</style>