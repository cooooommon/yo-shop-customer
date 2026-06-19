<template>
  <view class="container" :style="appThemeStyle">
    <view v-if="detail" class="therapist-detail">
      <!-- 头部信息 -->
      <view class="header-card">
        <image :src="detail.avatar_url || '/static/default-avatar.png'" mode="aspectFill" class="avatar-large" />
        <text class="name">{{ detail.name }}</text>
        <view class="tags">
          <text class="level-tag" :class="'level-' + detail.level">{{ levelText[detail.level] }}</text>
          <text class="status-tag" :class="'status-' + detail.status">{{ statusText[detail.status] }}</text>
        </view>
        <view class="rating-display">
          <text class="rating-star">★ ★ ★ ★ ★</text>
          <text class="rating-value">{{ detail.total_rating }}分</text>
          <text class="service-count">已服务{{ detail.total_service_count }}次</text>
        </view>
      </view>

      <!-- 技能与资质 -->
      <view class="info-card m-top20">
        <view class="card-title"><text>擅长技能</text></view>
        <text class="skill-text">{{ detail.skill_summary || '专业按摩服务' }}</text>
        <view class="card-title" style="margin-top: 24rpx"><text>从业信息</text></view>
        <view class="info-row">
          <text class="label">从业年限</text>
          <text class="value">{{ detail.experience_years }}年</text>
        </view>
        <view class="info-row">
          <text class="label">年龄</text>
          <text class="value">{{ detail.age || '未填写' }}岁</text>
        </view>
      </view>

      <!-- 个人介绍 -->
      <view v-if="detail.intro" class="info-card m-top20">
        <view class="card-title"><text>个人介绍</text></view>
        <mp-html :content="detail.intro" />
      </view>

      <!-- 可预约日历 -->
      <view class="info-card m-top20">
        <view class="card-title"><text>可预约时间</text></view>
        <view v-if="availableDates.length" class="date-scroll-wrap">
          <scroll-view scroll-x>
            <view
              v-for="d in availableDates"
              :key="d.date"
              class="date-item"
              :class="{ active: selectedDate === d.date }"
              @click="onSelectDate(d.date)"
            >
              <text class="date-day">{{ getDayText(d.date) }}</text>
              <text class="date-num">{{ getDateNum(d.date) }}</text>
            </view>
          </scroll-view>
        </view>
        <view v-if="selectedDate" class="slots-wrap">
          <view v-for="s in timeSlots" :key="s.timestamp" class="slot-item">
            <text>{{ s.start_time }} - {{ s.end_time }}</text>
          </view>
          <text v-if="timeSlots.length === 0" class="no-data">该日期暂无可用时段</text>
        </view>
      </view>

      <!-- 预约按钮 -->
      <view class="book-btn-wrap">
        <button class="book-btn" @click="onBookNow">立即预约</button>
      </view>
    </view>
  </view>
</template>

<script>
import * as TherapistApi from '@/api/therapist'
import * as ScheduleApi from '@/api/schedule'

const levelText = { 1: '初级', 2: '中级', 3: '高级', 4: '专家' }
const statusText = { 10: '休息中', 20: '空闲', 30: '服务中', 40: '已下线' }

export default {
  data () {
    return {
      levelText, statusText,
      detail: null,
      availableDates: [],
      selectedDate: '',
      timeSlots: []
    }
  },
  onLoad (options) {
    if (options.therapistId) {
      this.loadDetail(options.therapistId)
    }
  },
  methods: {
    loadDetail (therapistId) {
      TherapistApi.detail(therapistId).then(res => {
        this.detail = res.data.detail
        this.availableDates = this.detail.availableDates || []
      })
    },
    onSelectDate (date) {
      this.selectedDate = date
      ScheduleApi.slots(this.detail.therapist_id, date, 60).then(res => {
        this.timeSlots = res.data.slots || []
      })
    },
    getDayText (date) {
      const map = { 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日' }
      const d = new Date(date)
      return map[d.getDay() === 0 ? 7 : d.getDay()]
    },
    getDateNum (date) {
      return date.split('-')[2]
    },
    onBookNow () {
      uni.navigateTo({ url: '/pages/booking/create' })
    }
  }
}
</script>

<style lang="scss" scoped>
.container { min-height: 100vh; background: #f5f5f5; padding-bottom: 120rpx; }
.header-card { background: linear-gradient(180deg, #e8c269, #f5d998); padding: 50rpx 30rpx 30rpx; text-align: center;
  .avatar-large { width: 160rpx; height: 160rpx; border-radius: 80rpx; border: 4rpx solid #fff; }
  .name { font-size: 36rpx; font-weight: bold; display: block; margin-top: 16rpx; }
  .tags { margin-top: 12rpx; .level-tag, .status-tag { font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 12rpx; margin: 0 6rpx; }
    .level-1 { background: #f6ffed; color: #52c41a; } .level-2 { background: #e6f7ff; color: #1890ff; } .level-3 { background: #f9f0ff; color: #722ed1; } .level-4 { background: #fff2f0; color: #cf1322; }
    .status-20 { background: #f6ffed; color: #52c41a; } .status-10 { background: #fffbe6; color: #faad14; } .status-30 { background: #e6f7ff; color: #1890ff; } .status-40 { background: #f5f5f5; color: #999; }
  }
  .rating-display { margin-top: 16rpx; .rating-star { color: #faad14; font-size: 28rpx; } .rating-value { font-size: 28rpx; margin: 0 16rpx; } .service-count { font-size: 24rpx; color: #666; } }
}
.info-card { background: #fff; margin: 0 20rpx; border-radius: 12rpx; padding: 24rpx; margin-top: 20rpx;
  .card-title { font-size: 30rpx; font-weight: bold; margin-bottom: 16rpx; }
  .skill-text { font-size: 28rpx; color: #333; }
  .info-row { display: flex; justify-content: space-between; padding: 12rpx 0; border-bottom: 1rpx solid #f5f5f5; .label { color: #999; font-size: 26rpx; } .value { font-size: 26rpx; } }
}
.date-scroll-wrap { .date-item { display: inline-flex; flex-direction: column; align-items: center; padding: 16rpx 24rpx; margin-right: 16rpx; border-radius: 12rpx; background: #f5f5f5; &.active { background: #e8c269; color: #fff; } .date-day { font-size: 24rpx; } .date-num { font-size: 30rpx; font-weight: bold; } } }
.slots-wrap { display: flex; flex-wrap: wrap; margin-top: 16rpx; .slot-item { padding: 12rpx 20rpx; margin: 6rpx; border-radius: 8rpx; background: #f5f5f5; font-size: 24rpx; color: #666; } }
.no-data { color: #999; font-size: 24rpx; }
.book-btn-wrap { position: fixed; bottom: 0; left: 0; right: 0; padding: 16rpx 30rpx; background: #fff; .book-btn { width: 100%; height: 88rpx; line-height: 88rpx; background: linear-gradient(135deg, #e8c269, #f0a500); color: #fff; border-radius: 44rpx; font-size: 34rpx; } }
</style>