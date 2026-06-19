<template>
  <view class="container" :style="appThemeStyle">
    <!-- 快速预约入口 -->
    <view class="quick-booking" @click="onQuickBooking">
      <view class="qb-icon">
        <text class="iconfont icon-yuyue"></text>
      </view>
      <view class="qb-content">
        <text class="qb-title">快速预约</text>
        <text class="qb-desc">选择服务，预约理疗师上门</text>
      </view>
      <view class="qb-arrow">
        <text class="iconfont icon-arrow-right"></text>
      </view>
    </view>

    <!-- 进行中的预约 -->
    <view v-if="currentBooking" class="current-booking m-top20">
      <view class="section-title">
        <text>当前预约</text>
      </view>
      <view class="booking-card" @click="onBookingDetail(currentBooking.order_id)">
        <view class="card-header">
          <text class="status-tag" :style="{ color: statusColor[currentBooking.service_status] }">
            {{ statusText[currentBooking.service_status] || '未知' }}
          </text>
          <text class="order-no">{{ currentBooking.order_no }}</text>
        </view>
        <view class="card-body">
          <view class="goods-info" v-for="item in currentBooking.goods" :key="item.order_goods_id">
            <image class="goods-image" :src="item.goods_image" mode="aspectFill" />
            <view class="goods-detail">
              <text class="goods-name oneline-hide">{{ item.goods_name }}</text>
              <text class="goods-duration">{{ item.duration || 60 }}分钟</text>
            </view>
          </view>
        </view>
        <view class="card-footer">
          <view class="appointment-time">
            <text class="iconfont icon-shijian"></text>
            <text>{{ formatTime(currentBooking.appointment_time) }}</text>
          </view>
          <view class="card-actions">
            <text v-if="currentBooking.service_status === 10" class="action-btn cancel" @click.stop="onCancel(currentBooking.order_id)">取消预约</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 预约列表 -->
    <view class="booking-list m-top20">
      <view class="section-title">
        <text>我的预约</text>
        <text class="more" @click="onAllBookings">全部</text>
      </view>
      <view v-if="isLoading" class="loading-wrap">
        <u-loading mode="circle" />
      </view>
      <view v-else-if="list.length === 0" class="empty-wrap">
        <empty tips="暂无预约记录" />
      </view>
      <view v-else class="list-wrap">
        <view class="booking-card" v-for="item in list" :key="item.order_id" @click="onBookingDetail(item.order_id)">
          <view class="card-header">
            <text class="status-tag" :style="{ color: statusColor[item.service_status] }">
              {{ statusText[item.service_status] || '未知' }}
            </text>
            <text class="order-no">{{ item.order_no }}</text>
          </view>
          <view class="card-body">
            <view class="goods-info" v-for="g in item.goods" :key="g.order_goods_id">
              <image class="goods-image" :src="g.goods_image" mode="aspectFill" />
              <view class="goods-detail">
                <text class="goods-name oneline-hide">{{ g.goods_name }}</text>
                <text class="goods-duration">{{ item.appointment_duration || 60 }}分钟</text>
              </view>
            </view>
          </view>
          <view class="card-footer">
            <text class="appointment-time">{{ formatTime(item.appointment_time) }}</text>
            <text class="price">¥{{ item.pay_price }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { checkLogin } from '@/core/app'
import * as BookingApi from '@/api/booking'

const statusText = { 10: '待确认', 20: '已确认', 30: '服务中', 40: '已完成', 50: '已评价' }
const statusColor = { 10: '#faad14', 20: '#1890ff', 30: '#52c41a', 40: '#999', 50: '#722ed1' }

export default {
  data () {
    return {
      statusText, statusColor,
      isLoading: true,
      list: [],
      currentBooking: null
    }
  },
  onShow () {
    if (checkLogin()) {
      this.loadData()
    }
  },
  methods: {
    loadData () {
      this.isLoading = true
      BookingApi.list({ page: 1 }).then(res => {
        const data = res.data.list
        this.list = data.data || []
        // 找出进行中的预约
        this.currentBooking = this.list.find(item => [10, 20, 30].includes(item.service_status)) || null
      }).finally(() => { this.isLoading = false })
    },
    formatTime (timestamp) {
      if (!timestamp) return ''
      const d = new Date(timestamp * 1000)
      return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    },
    onQuickBooking () {
      uni.navigateTo({ url: '/pages/booking/create' })
    },
    onBookingDetail (orderId) {
      uni.navigateTo({ url: `/pages/booking/detail?orderId=${orderId}` })
    },
    onAllBookings () {
      uni.navigateTo({ url: '/pages/booking/list' })
    },
    onCancel (orderId) {
      uni.showModal({
        title: '取消预约',
        content: '确定要取消该预约吗？',
        success: (res) => {
          if (res.confirm) {
            BookingApi.cancel(orderId, { remark: '用户取消' }).then(() => {
              uni.showToast({ title: '已取消', icon: 'success' })
              this.loadData()
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100rpx;
}
.quick-booking {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #e8c269, #f0a500);
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  color: #fff;
  .qb-icon { font-size: 50rpx; margin-right: 20rpx; }
  .qb-content { flex: 1; .qb-title { font-size: 34rpx; font-weight: bold; display: block; } .qb-desc { font-size: 24rpx; opacity: 0.8; } }
  .qb-arrow { font-size: 30rpx; opacity: 0.8; }
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  font-size: 30rpx;
  font-weight: bold;
  .more { font-size: 26rpx; color: #999; }
}
.booking-card {
  margin: 0 20rpx 16rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  .card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
    .status-tag { font-size: 28rpx; font-weight: bold; }
    .order-no { font-size: 24rpx; color: #999; }
  }
  .card-body {
    .goods-info {
      display: flex;
      .goods-image { width: 100rpx; height: 100rpx; border-radius: 8rpx; margin-right: 16rpx; }
      .goods-detail { flex: 1; .goods-name { font-size: 28rpx; } .goods-duration { font-size: 24rpx; color: #999; } }
    }
  }
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid #f0f0f0;
    .appointment-time { font-size: 26rpx; color: #666; }
    .price { font-size: 30rpx; font-weight: bold; color: #e8403a; }
    .card-actions {
      .action-btn { font-size: 26rpx; padding: 8rpx 20rpx; border-radius: 20rpx; }
      .cancel { color: #999; border: 1rpx solid #ddd; }
    }
  }
}
.loading-wrap, .empty-wrap { padding: 80rpx 0; text-align: center; }
</style>