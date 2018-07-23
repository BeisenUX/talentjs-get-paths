define(['templates/common',
  'vendor/plugins/simplemodal-view', 'helpers/context',
  'views/common/buttons/recommend-listip-table-view',
  'models/common-recommend-search-model'
],
function (jst, SimpleModalView, Context, RecommendListTableView,  // 表格中的数据
CommonRecommendSearchModel) {
  return Talent.Layout.extend({
    className: 'approvals-pop-wrapper',
    template: jst['common/buttons/recommend-listip'],
    ui: {
      'selected': '#personList li input',
      'submit': '#all_user_btn_save',
      'close': '#closePop',
      'concel': '#all_user_btn_con',
      'checrecommenderr': '.checrecommenderr',
      'inputSearch': '.recommendSearch', // 搜索框
      'searchVal': '.search_btn' // 搜索按钮
    },
    events: function () {
      var events = {}
      events['click ' + this.ui.selected] = 'onSelected'
      events['click ' + this.ui.submit] = 'onSubmit'
      events['click ' + this.ui.close] = 'closePop'
      events['click ' + this.ui.concel] = 'onConcel'
      events['keyup ' + this.ui.inputSearch] = 'inputSearch' // 回车执行搜索方法
      events['click ' + this.ui.searchVal] = 'onSearch'
      events['keyup ' + this.ui.Adaptive] = 'stopPop'  // 回车执行搜索方法
      events['keypress ' + this.ui.Adaptive] = 'stopPop'  // 回车执行搜索方法
      events['keydown ' + this.ui.Adaptive] = 'stopPop'  // 回车执行搜索方法
      return events
    },
    initialize: function () {
      // 获取表格中的内容显示出来
      this.model = new Talent.Model()
      this.recommendListTableView = new RecommendListTableView()

      this.saveModel = new CommonRecommendSearchModel()
      this.iDisplayIndex = 0
      this.recommendPopView = new SimpleModalView({
        position: [0, null]
      })
      this.recommendPopView.setElement(this.$el)
      this.showSearch = this.options.showSearch || false
      this.iDisplayLength = this.options.iDisplayLength || 15
    },
    render: function () {
      var data = {'showSearch': this.showSearch}
      var self = this
        // 获取表格的数据
      this.model.clear().save({
        'JobId': this.options.jobid || '',
        'iDisplayStart': 0,   // 从第几条开始显示
        'iDisplayLength': self.iDisplayLength
      }, {
        url: 'RecruitPlan/OfferProcess/GetRecruitmentRequirementsList'
      }).done(function (resp) {
        // 此处获取接口数据
        resp.dataList = self.escapeList(resp.dataList)
        self.recommendListTableView.collection.reset(resp.dataList)
        // 页面加载时，把职位的内容append到页面中
        self.$('.table_list_wrap').html(self.recommendListTableView.render())
        // 滚动加载更多
        if (self.showSearch) {
          var nScrollHight = 0 // 滚动距离总长(注意不是滚动条的长度)
          var nScrollTop = 0   // 滚动到的当前位置
          var nDivHight = 160
          self.$('.dtgray_wraps').scroll(function () {
            nScrollHight = self.$(this)[0].scrollHeight // 滚动距离总长
            nScrollTop = self.$(this)[0].scrollTop // 滚动到的当前位置
            if (nScrollTop + nDivHight >= nScrollHight) {
              self.iDisplayIndex = self.iDisplayIndex + self.iDisplayLength
              self.model.clear().save({
                'JobId': self.options.jobid || '',
                'iDisplayStart': self.iDisplayIndex,   // 从第几条开始显示
                'iDisplayLength': self.iDisplayLength // 显示多少条数据
              }, {
                url: 'RecruitPlan/OfferProcess/GetRecruitmentRequirementsList'
              }).done(function (resp) {
                var data = {}
                resp.dataList = self.escapeList(resp.dataList)
                self.recommendListTableView.collection.add(resp.dataList)
                if (self.recommendListTableView.collection) {
                  data.dataList = self.recommendListTableView.collection
                }
              })
            }
          })
        }
      })
      var dialogHtml = self.template(data)
      self.recommendPopView.render(dialogHtml).appendTo(self.$el)
      return this.$el
    },
        // 此函说遍历了后端数据中要显示出来的数据名
    escapeList: function (datalist) {
      $.each(datalist, function () {
        var self = this
        self.DepartmentName = _.escape(self.DepartmentName)
        self.Name = _.escape(self.Name)
        self.DutyUserName = _.escape(self.DutyUserName)
        self.ArivalCount = _.escape(self.ArivalCount)
        self.ArivalTime = _.formatDate(_.escape(self.ArivalTime))
        self.CreateDate = _.formatDate(_.escape(self.CreateDate))
        self.RequirementCount = _.escape(self.RequirementCount)
      })
      return datalist
    },
        // 点击确认按钮，把选中的人数ID的checked改变
    onSubmit: function (e) {
      e.stopPropagation()
          // 放在最后会无法触发close事件
      this.trigger('close')
      var self = this
      var selectedPost = {}
      var selectArr = []
      var textname = ''
      var textid = ''
      self.$('.table_contain_dw tbody').find('td').each(function () {
        var thisCheck = self.$(this).find("input.contain_has_checked[type='radio']").is(':checked')
        if (thisCheck == true) {
          textname = $(this).find('span').text()
          textid = $(this).find('.contain_checked_dw').attr('id')
          selectedPost = { textname: textname, textid: textid }
          selectArr.push(selectedPost)
        }
      })
      $('.form_txaleft .frm_list').find('li').find('.Inputip').val(textname)
      $('.form_txaleft .frm_list').find('li').find('.Inputip').attr('myAttr', textid)

      if (selectArr.length == 0) {
        this.recommendPopView.close()
        return false
      }
      if (selectArr[0].pId != '-1') {
        // $(".checrecommenderr").css("display","none")
        $('#all_user_btn_save').addClass('simplemodal-close')
        this.trigger('submit', selectArr)
        this.recommendPopView.close()
      } else {
        $('.checrecommenderr').css('display', 'inline-block')
      }
    },
    closePop: function () {
      this.recommendPopView.close()
      this.trigger('close')
    },
    // 点击取消关闭dialog弹框
    onConcel: function () {
      // e.stopPropagation()
      this.recommendPopView.close()
      // this.trigger('removeView');
      this.trigger('close')
    },
    inputSearch: function (e) {
      e.preventDefault()
      e.stopPropagation()
      if (e.keyCode == 13) {
        this.onSearch()
      }
    },
    // 点击搜索按钮时，重新渲染表格数据
    onSearch: function () {
      // $(this)[0].scrollTop=0;
      var self = this
      self.iDisplayIndex = 0
      var thisVal = _.valueTrimBr(self.$('.searchValue').val())
      this.model.clear().save({
        'name': thisVal
      }, {
        url: 'RecruitPlan/OfferProcess/GetRecruitmentRequirementsList'
      }).done(function (resp) {
        var data = {}
        resp.dataList = self.escapeList(resp.dataList)
        self.recommendListTableView.collection.highlight(resp.dataList, thisVal)
        self.recommendListTableView.collection.reset(resp.dataList)
        if (self.recommendListTableView.collection) {
          data.dataList = self.recommendListTableView.collection
        }
      })
    },
    stopPop: function (e) {
      if (e.keyCode == 13) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
  })
})
