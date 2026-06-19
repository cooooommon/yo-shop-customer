<template>
  <view class="container" :style="appThemeStyle">
    <view class="booking-form">
      <!-- 步骤1: 选择服务 -->
      <view class="form-section">
        <view class="section-label">选择服务</view>
        <view class="service-list">
          <view
            v-for="item in serviceList"
            :key="item.goods_id"
            class="service-item"
            :class="{ active: selectedService && selectedService.goods_id === item.goods_id }"
            @click="onSelectService(item)"
          >
            <image :src="item.goods_image" mode="aspectFill" class="service-img" />
            <view class="service-info">
              <text class="service-name">{{ item.goods_name }}</text>
              <text class="service-desc">{{ item.selling_point || '专业按摩服务' }}</text>
              <view class="service-meta">
                <text class="duration">{{ item.service_duration || 60 }}分钟</text>
                <text class="price">¥{{ item.goods_price_min }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 步骤2: 选择理疗师 -->
      <view v-if="selectedService" class="form-section m-top20">
        <view class="section-label">
          <text>选择理疗师</text>
          <text class="auto-assign" @click="onAutoAssign">自动分配</text>
        </view>
        <scroll-view scroll-x class="therapist-scroll" v-if="therapistList.length">
          <view
            v-for="t in therapistList"
            :key="t.therapist_id"
            class="therapist-item"
            :class="{ active: selectedTherapist && selectedTherapist.therapist_id === t.therapist_id }"
            @click="onSelectTherapist(t)"
          >
            <image :src="t.avatar_url || '/static/default-avatar.png'" mode="aspectFill" class="therapist-avatar" />
            <text class="therapist-name">{{ t.name }}</text>
            <view class="therapist-level">
              <text class="level-tag" :class="'level-' + t.level">{{ levelText[t.level] }}</text>
            </view>
            <view class="therapist-rating">
              <text class="rating-star">★</text>
              <text>{{ t.total_rating }}</text>
            </view>
          </view>
        </scroll-view>
        <view v-else class="no-data">
          <text>暂无可用理疗师</text>
        </view>
      </view>

      <!-- 步骤3: 选择时间 -->
      <view v-if="selectedTherapist" class="form-section m-top20">
        <view class="section-label">选择预约时间</view>
        <!-- 日期选择 -->
        <scroll-view scroll-x class="date-scroll">
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
        <!-- 时间段选择 -->
        <view v-if="selectedDate" class="slot-grid">
          <view
            v-for="s in timeSlots"
            :key="s.timestamp"
            class="slot-item"
            :class="{ active: selectedSlot && selectedSlot.timestamp === s.timestamp }"
            @click="onSelectSlot(s)"
          >
            <text>{{ s.start_time }} - {{ s.end_time }}</text>
          </view>
          <view v-if="timeSlots.length === 0" class="no-slots">
            <text>该日期暂无可用时间段</text>
          </view>
        </view>
      </view>

      <!-- 步骤4: 确认地址 -->
      <view v-if="selectedSlot" class="form-section m-top20">
        <view class="section-label">服务地址</view>
        <view class="address-select" @click="onSelectAddress">
          <view v-if="selectedAddress" class="address-info">
            <text class="address-detail">{{ selectedAddress.detail }}</text>
            <text class="address-name">{{ selectedAddress.name }} {{ selectedAddress.phone }}</text>
          </view>
          <view v-else class="no-address">
            <text>请选择服务地址</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view v-if="selectedAddress" class="submit-section">
        <view class="booking-summary">
          <text class="total-label">预估费用</text>
          <text class="total-price">¥{{ selectedService.goods_price_min }}</text>
        </view>
        <button class="submit-btn" :loading="submitting" @click="onSubmit">立即预约</button>
      </view>
    </view>
  </view>
</template>

<script>
import { checkLogin } from '@/core/app'
import * as GoodsApi from '@/api/goods/index'
import * as TherapistApi from '@/api/therapist'
import * as ScheduleApi from '@/api/schedule'
import * as BookingApi from '@/api/booking'
import * as AddressApi from '@/api/address'

const levelText = { 1: '初级', 2: '中级', 3: '高级', 4: '专家' }

export default {
  data () {
    return {
      levelText,
      serviceList: [],
      selectedService: null,
      therapistList: [],
      selectedTherapist: null,
      availableDates: [],
      selectedDate: '',
      timeSlots: [],
      selectedSlot: null,
      selectedAddress: null,
      submitting: false
    }
  },
  onLoad () {
    this.loadServices()
  },
  methods: {
    loadServices () {
      GoodsApi.list({ goodsType: 20 }).then(res => {
        this.serviceList = res.data.list.data || []
      })
    },
    onSelectService (item) {
      this.selectedService = item
      this.selectedTherapist = null
      this.selectedDate = ''
      this.selectedSlot = null
      this.timeSlots = []
      // 加载可服务的理疗师
      TherapistApi.match(item.goods_id).then(res => {
        this.therapistList = res.data.list || []
      })
    },
    onAutoAssign () {
      if (this.therapistList.length > 0) {
        this.onSelectTherapist(this.therapistList[0])
      }
    },
    onSelectTherapist (t) {
      this.selectedTherapist = t
      this.selectedDate = ''
      this.selectedSlot = null
      this.timeSlots = []
      // 加载可预约日期
      ScheduleApi.dates(t.therapist_id, 14).then(res => {
        this.availableDates = res.data.dates || []
      })
    },
    onSelectDate (date) {
      this.selectedDate = date
      this.selectedSlot = null
      ScheduleApi.slots(this.selectedTherapist.therapist_id, date, this.selectedService.service_duration || 60).then(res => {
        this.timeSlots = res.data.slots || []
      })
    },
    onSelectSlot (s) {
      this.selectedSlot = s
    },
    onSelectAddress () {
      uni.navigateTo({ url: '/pages/address/index?selectMode=1' })
    },
    getDayText (date) {
      const map = { 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日' }
      const d = new Date(date)
      return map[d.getDay() === 0 ? 7 : d.getDay()]
    },
    getDateNum (date) {
      return date.split('-')[2]
    },
    onSubmit () {
      if (!checkLogin()) return
      if (!this.selectedAddress) {
        uni.showToast({ title: '请选择服务地址', icon: 'none' })
        return
      }
      this.submitting = true
      const data = {
        serviceId: this.selectedService.goods_id,
        therapistId: this.selectedTherapist.therapist_id,
        appointmentTime: this.selectedSlot.timestamp,
        appointmentDuration: this.selectedService.service_duration || 60,
        addressId: this.selectedAddress.address_id
      }
      BookingApi.create(data).then(res => {
        const orderId = res.data.orderId
        if (orderId) {
          // 创建成功，跳转收银台支付
          uni.navigateTo({ url: `/pages/checkout/cashier/index?orderId=${orderId}` })
        } else {
          uni.showToast({ title: '预约创建失败', icon: 'none' })
        }
      }).finally(() => { this.submitting = false })
    }
  }
}
</script>

<style lang="scss" scoped>
.container { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.form-section {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.section-label {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  .auto-assign { font-size: 24rpx; color: #e8c269; font-weight: normal; }
}
.service-list {
  .service-item {
    display: flex;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    &.active { background: #fff8e8; border-radius: 8rpx; padding: 16rpx; }
    .service-img { width: 120rpx; height: 120rpx; border-radius: 8rpx; margin-right: 16rpx; }
    .service-info { flex: 1;
      .service-name { font-size: 30rpx; display: block; }
      .service-desc { font-size: 24rpx; color: #999; }
      .service-meta { display: flex; justify-content: space-between; margin-top: 8rpx;
        .duration { font-size: 24rpx; color: #666; }
        .price { font-size: 32rpx; font-weight: bold; color: #e8403a; }
      }
    }
  }
}
.therapist-scroll { white-space: nowrap; padding: 8rpx 0; }
.therapist-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 20rpx;
  margin-right: 20rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  &.active { background: #fff8e8; border: 2rpx solid #e8c269; }
  .therapist-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; }
  .therapist-name { font-size: 26rpx; margin-top: 8rpx; }
  .therapist-level { .level-tag { font-size: 20rpx; padding: 2rpx 8rpx; border-radius: 4rpx; } .level-1 { color: #52c41a; background: #f6ffed; } .level-2 { color: #1890ff; background: #e6f7ff; } .level-3 { color: #722ed1; background: #f9f0ff; } .level-4 { color: #cf1322; background: #fff2f0; } }
  .therapist-rating { font-size: 22rpx; color: #faad14; .rating-star { margin-right: 4rpx; } }
}
.date-scroll { white-space: nowrap; padding: 8rpx 0;
  .date-item { display: inline-flex; flex-direction: column; align-items: center; padding: 16rpx 24rpx; margin-right: 16rpx; border-radius: 12rpx; background: #f5f5f5; &.active { background: #e8c269; color: #fff; }
    .date-day { font-size: 24rpx; }
    .date-num { font-size: 30rpx; font-weight: bold; }
  }
}
.slot-grid { display: flex; flex-wrap: wrap; padding: 8rpx 0;
  .slot-item { padding: 16rpx 24rpx; margin: 8rpx; border-radius: 8rpx; background: #f5f5f5; font-size: 26rpx; &.active { background: #e8c269; color: #fff; } }
  .no-slots { width: 100%; text-align: center; color: #999; padding: 40rpx 0; }
}
.address-select { padding: 20rpx; background: #f9f9f9; border-radius: 8rpx; .address-detail { font-size: 28rpx; display: block; } .address-name { font-size: 24rpx; color: #666; } .no-address { font-size: 28rpx; color: #999; } }
.submit-section { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 20rpx 30rpx; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  .booking-summary { .total-label { font-size: 26rpx; color: #666; display: block; } .total-price { font-size: 40rpx; font-weight: bold; color: #e8403a; } }
  .submit-btn { width: 240rpx; height: 80rpx; line-height: 80rpx; background: linear-gradient(135deg, #e8c269, #f0a500); color: #fff; border-radius: 40rpx; font-size: 32rpx; }
}
.no-data { text-align: center; color: #999; padding: 40rpx 0; }
</style>