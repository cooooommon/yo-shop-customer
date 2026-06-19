<template>
  <view v-show="!isLoading" class="container" :style="appThemeStyle">
    <!-- 鍟嗗搧鍥剧墖杞挱 -->
    <SlideImage v-if="!isLoading" :video="goods.video" :videoCover="goods.videoCover" :images="goods.goods_images" />

    <!-- 鍟嗗搧淇℃伅 -->
    <view v-if="!isLoading" class="goods-info m-top20">
      <!-- 浠锋牸銆侀攢閲?-->
      <view class="info-item info-item__top dis-flex flex-x-between flex-y-end">
        <view class="block-left dis-flex flex-y-center">
          <!-- 鍟嗗搧鍞环 -->
          <text class="floor-price__samll">锟?/text>
          <text class="floor-price">{{ goods.goods_price_min }}</text>
          <!-- 浼氬憳浠锋爣绛?-->
          <view v-if="goods.is_user_grade" class="user-grade">
            <text>浼氬憳浠?/text>
          </view>
          <!-- 鍒掔嚎浠?-->
          <text v-if="goods.line_price_min > 0" class="original-price">锟{ goods.line_price_min }}</text>
        </view>
        <view class="block-right dis-flex">
          <!-- 閿€閲?-->
          <view class="goods-sales">
            <text>宸插敭{{ goods.goods_sales }}浠?/text>
          </view>
        </view>
      </view>
      <!-- 鏍囬銆佸垎浜?-->
      <view class="info-item info-item__name dis-flex flex-y-center">
        <view class="goods-name flex-box">
          <text class="twoline-hide">{{ goods.goods_name }}</text>
        </view>
        <view class="goods-share__line"></view>
        <view class="goods-share">
          <button class="share-btn dis-flex flex-dir-column" @click="onShowShareSheet()">
            <text class="share__icon iconfont icon-fenxiang"></text>
            <text class="f-24">鍒嗕韩</text>
          </button>
        </view>
      </view>
      <!-- 鍟嗗搧鍗栫偣 -->
      <view v-if="goods.selling_point" class="info-item info-item_selling-point">
        <text>{{ goods.selling_point }}</text>
      </view>
    </view>

    <!-- 閫夋嫨鍟嗗搧瑙勬牸 -->
    <view v-if="goods.spec_type == 20" class="goods-choice m-top20 b-f" @click="onShowSkuPopup(1)">
      <view class="spec-list">
        <view class="flex-box">
          <text class="col-8">閫夋嫨锛?/text>
          <text class="spec-name" v-for="(item, index) in goods.specList" :key="index">{{ item.spec_name }}</text>
        </view>
        <view class="f-26 col-9 t-r">
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>
    </view>

    <!-- 鍟嗗搧鏈嶅姟 -->
    <Service v-if="!isLoading" :goods-id="goodsId" />

    <!-- 鍟嗗搧SKU寮圭獥 -->
    <SkuPopup v-if="!isLoading" v-model="showSkuPopup" :skuMode="skuMode" :goods="goods" @addCart="onAddCart" />

    <!-- 鍟嗗搧璇勪环 -->
    <Comment v-if="!isLoading" :goods-id="goodsId" :limit="2" />

    <!-- 鍟嗗搧鎻忚堪 -->
    <view v-if="!isLoading" class="goods-content m-top20">
      <view class="item-title b-f">
        <text>鍟嗗搧鎻忚堪</text>
      </view>
      <view v-if="goods.content != ''" class="goods-content__detail b-f">
        <mp-html :content="goods.content" />
      </view>
    </view>

    <!-- 搴曢儴閫夐」鍗?-->
    <view class="footer-fixed">
      <view class="footer-container">
        <!-- 瀵艰埅鍥炬爣 -->
        <view class="foo-item-fast">
          <!-- 棣栭〉 -->
          <view class="fast-item fast-item--home" @click="onTargetHome">
            <view class="fast-icon">
              <text class="iconfont icon-shouye"></text>
            </view>
            <view class="fast-text">
              <text>棣栭〉</text>
            </view>
          </view>
          <!-- 瀹㈡湇 -->
          <customer-btn v-if="isShowCustomerBtn" :showCard="true" :cardTitle="goods.goods_name" :cardImage="goods.goods_image"
            :cardPath="pagePath">
            <view class="fast-item">
              <view class="fast-icon">
                <text class="iconfont icon-kefu1"></text>
              </view>
              <view class="fast-text">
                <text>瀹㈡湇</text>
              </view>
            </view>
          </customer-btn>
          <!-- 璐墿杞?-->
          <view class="fast-item fast-item--cart" @click="onTargetBooking">
            <view class="fast-icon">
              <text class="iconfont icon-yuyue"></text>
            </view>
            <view class="fast-text">
              <text>棰勭害</text>
            </view>
          </view>
        </view>
        <!-- 鎿嶄綔鎸夐挳 -->
        <view class="foo-item-btn">
          <view class="btn-wrapper">
            <view class="btn-item btn-item-main" @click="onTargetBooking">
              <text>绔嬪嵆棰勭害</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 蹇嵎瀵艰埅 -->
    <!-- <shortcut bottom="120" /> -->

    <!-- 鍒嗕韩鑿滃崟 -->
    <share-sheet v-model="showShareSheet" :shareTitle="goods.goods_name" :shareImageUrl="goods.goods_image" />

  </view>
</template>

<script>
  import { getSceneData } from '@/core/app'
  import * as GoodsApi from '@/api/goods'
  import SettingModel from '@/common/model/Setting'
  import { GoodsTypeEnum } from '@/common/enum/goods'
  import ShareSheet from '@/components/share-sheet'
  import CustomerBtn from '@/components/customer-btn'
  import SlideImage from './components/SlideImage'
  import SkuPopup from './components/SkuPopup'
  import Comment from './components/Comment'
  import Service from './components/Service'

  export default {
    components: {
      ShareSheet,
      CustomerBtn,
      SlideImage,
      SkuPopup,
      Comment,
      Service
    },
    data() {
      return {
        isLoading: true,
        goodsId: null,
        goods: {},
        showSkuPopup: false,
        skuMode: 1,
        showShareSheet: false,
        isEnableCart: false,
        isShowCustomerBtn: false,
      }
    },
    computed: {
      pagePath() {
        const params = this.$getShareUrlParams({ goodsId: this.goodsId })
        return `/pages/goods/detail?${params}`
      }
    },
    async onLoad(options) {
      this.onRecordQuery(options)
      this.onRefreshPage()
      this.isShowCustomerBtn = await SettingModel.isShowCustomerBtn()
    },
    methods: {
      onRecordQuery(query) {
        const scene = getSceneData(query)
        this.goodsId = query.goodsId ? parseInt(query.goodsId) : parseInt(scene.gid)
      },
      onRefreshPage() {
        const app = this
        app.isLoading = true
        app.getGoodsDetail().finally(() => app.isLoading = false)
      },
      getGoodsDetail() {
        const app = this
        return new Promise((resolve, reject) => {
          GoodsApi.detail(app.goodsId)
            .then(result => {
              app.goods = result.data.detail
              resolve(result)
            })
            .catch(reject)
        })
      },
      onShowSkuPopup(skuMode = 1) {
        const app = this
        app.skuMode = skuMode
        app.showSkuPopup = !app.showSkuPopup
      },
      onShowShareSheet() {
        this.showShareSheet = !this.showShareSheet
      },
      onTargetHome(e) {
        this.$navTo('pages/index/index')
      },
      onTargetBooking() {
        uni.navigateTo({ url: '/pages/booking/create?serviceId=' + this.goodsId })
      },
    },
    onShareAppMessage() {
      return {
        title: this.goods.goods_name,
        path: this.pagePath
      }
    },
    onShareTimeline() {
      return {
        title: this.goods.goods_name,
        path: this.pagePath
      }
    }
  }
</script>

<style>
  page {
    background: #fafafa;
  }
</style>
<style lang="scss" scoped>
  @import "./detail.scss";
</style>

