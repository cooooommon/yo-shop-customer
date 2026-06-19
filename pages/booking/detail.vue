<template>
  <view class="container" :style="appThemeStyle">
    <view v-if="detail" class="booking-detail">
      <!-- 状态头部 -->
      <view class="detail-header">
        <view class="status-badge" :style="{ background: statusBg[detail.service_status] }">
          <text>{{ statusText[detail.service_status] }}</text>
        </view>
        <text class="status-desc">{{ statusDesc[detail.service_status] }}</text>
      </view>

      <!-- 理疗师信息 -->
      <view v-if="detail.therapist" class="info-card m-top20" @click="onTherapistDetail">
        <view class="card-title">
          <text>理疗师信息</text>
        </view>
        <view class="therapist-info">
          <image :src="detail.therapist.avatar_url || '/static/default-avatar.png'" mode="aspectFill" class="therapist-avatar" />
          <view class="therapist-detail">
            <text class="name">{{ detail.therapist.name }}</text>
            <text class="level">等级：{{ levelText[detail.therapist.level] }}</text>
            <text class="mobile">电话：{{ detail.therapist.mobile }}</text>
          </view>
          <view class="contact-btn" @click.stop="onCallTherapist">
            <text class="iconfont icon-dianhua"></text>
          </view>
        </view>
      </view>

      <!-- 预约信息 -->
      <view class="info-card m-top20">
        <view class="card-title"><text>预约信息</text></view>
        <view class="info-row">
          <text class="label">预约编号</text>
          <text class="value">{{ detail.order_no }}</text>
        </view>
        <view class="info-row">
          <text class="label">预约时间</text>
          <text class="value highlight">{{ formatDateTime(detail.appointment_time) }}</text>
        </view>
        <view class="info-row">
          <text class="label">服务时长</text>
          <text class="value">{{ detail.appointment_duration || 60 }}分钟</text>
        </view>
        <view class="info-row" v-if="detail.arrival_time">
          <text class="label">到达时间</text>
          <text class="value">{{ formatDateTime(detail.arrival_time) }}</text>
        </view>
      </view>

      <!-- 服务项目 -->
      <view class="info-card m-top20">
        <view class="card-title"><text>服务项目</text></view>
        <view class="goods-item" v-for="item in detail.goods" :key="item.order_goods_id">
          <image :src="item.goods_image" mode="aspectFill" class="goods-image" />
          <view class="goods-info">
            <text class="goods-name">{{ item.goods_name }}</text>
            <text class="goods-price">¥{{ item.goods_price }}</text>
          </view>
        </view>
      </view>

      <!-- 服务地址 -->
      <view v-if="detail.address" class="info-card m-top20">
        <view class="card-title"><text>服务地址</text></view>
        <view class="address-info">
          <text class="address-detail">{{ detail.address.detail }}</text>
          <text class="address-contact">{{ detail.address.name }} {{ detail.address.phone }}</text>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="footer-actions" v-if="showActions">
        <button v-if="detail.service_status === 10" class="action-btn cancel" @click="onCancel">取消预约</button>
        <button v-if="detail.service_status === 40" class="action-btn rate" @click="onRate">去评价</button>
      </view>
    </view>
  </view>
</template>

<script>
import * as BookingApi from '@/api/booking'

const statusText = { 10: '待确认', 20: '已确认', 30: '服务中', 40: '已完成', 50: '已评价' }
const statusBg = { 10: '#faad14', 20: '#1890ff', 30: '#52c41a', 40: '#999', 50: '#722ed1' }
const statusDesc = {
  10: '理疗师正在确认您的预约...',
  20: '理疗师已确认，将准时上门',
  30: '理疗师正在为您服务中',
  40: '服务已完成',
  50: '感谢您的评价'
}
const levelText = { 1: '初级', 2: '中级', 3: '高级', 4: '专家' }

export default {
  data () {
    return {
      statusText, statusBg, statusDesc, levelText,
      detail: null
    }
  },
  computed: {
    showActions () {
      return [10, 40].includes(this.detail?.service_status)
    }
  },
  onLoad (options) {
    if (options.orderId) {
      this.loadDetail(options.orderId)
    }
  },
  methods: {
    loadDetail (orderId) {
      BookingApi.detail(orderId).then(res => {
        this.detail = res.data.detail
      })
    },
    formatDateTime (ts) {
      if (!ts) return ''
      const d = new Date(ts * 1000)
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
    },
    onCancel () {
      uni.showModal({
        title: '取消预约',
        content: '确定要取消该预约吗？',
        success: (res) => {
          if (res.confirm) {
            BookingApi.cancel(this.detail.order_id, { remark: '用户取消' }).then(() => {
              uni.showToast({ title: '已取消', icon: 'success' })
              this.loadDetail(this.detail.order_id)
            })
          }
        }
      })
    },
    onRate () {
      uni.navigateTo({ url: `/pages/order/comment/index?orderId=${this.detail.order_id}&therapistId=${this.detail.therapist_id}` })
    },
    onTherapistDetail () {
      uni.navigateTo({ url: `/pages/therapist/detail?therapistId=${this.detail.therapist_id}` })
    },
    onCallTherapist () {
      if (this.detail?.therapist?.mobile) {
        uni.makePhoneCall({ phoneNumber: this.detail.therapist.mobile })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container { min-height: 100vh; background: #f5f5f5; padding-bottom: 120rpx; }
.detail-header { background: #fff; padding: 40rpx 30rpx; text-align: center;
  .status-badge { display: inline-block; color: #fff; padding: 8rpx 30rpx; border-radius: 20rpx; font-size: 30rpx; }
  .status-desc { display: block; margin-top: 16rpx; font-size: 26rpx; color: #666; }
}
.info-card { background: #fff; margin: 0 20rpx; border-radius: 12rpx; padding: 24rpx;
  .card-title { font-size: 30rpx; font-weight: bold; margin-bottom: 16rpx; }
}
.therapist-info { display: flex; align-items: center;
  .therapist-avatar { width: 100rpx; height: 100rpx; border-radius: 50%; margin-right: 20rpx; }
  .therapist-detail { flex: 1; .name { font-size: 30rpx; font-weight: bold; display: block; } .level, .mobile { font-size: 24rpx; color: #666; display: block; } }
  .contact-btn { width: 80rpx; height: 80rpx; background: #e8f5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; .iconfont { font-size: 36rpx; color: #52c41a; } }
}
.info-row { display: flex; justify-content: space-between; padding: 12rpx 0; border-bottom: 1rpx solid #f5f5f5; .label { color: #999; font-size: 26rpx; } .value { font-size: 26rpx; &.highlight { color: #e8c269; font-weight: bold; } } }
.goods-item { display: flex; padding: 16rpx 0; .goods-image { width: 100rpx; height: 100rpx; border-radius: 8rpx; margin-right: 16rpx; } .goods-info { flex: 1; .goods-name { font-size: 28rpx; display: block; } .goods-price { font-size: 30rpx; font-weight: bold; color: #e8403a; } } }
.address-info { .address-detail { font-size: 28rpx; display: block; } .address-contact { font-size: 24rpx; color: #666; display: block; margin-top: 8rpx; } }
.footer-actions { position: fixed; bottom: 0; left: 0; right: 0; padding: 20rpx 30rpx; background: #fff; display: flex; justify-content: flex-end; gap: 20rpx;
  .action-btn { padding: 16rpx 40rpx; border-radius: 30rpx; font-size: 28rpx; &.cancel { color: #999; background: #f5f5f5; } &.rate { color: #fff; background: #e8c269; } }
}
</style>