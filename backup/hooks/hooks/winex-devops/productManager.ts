// 新制品管理  http://172.16.0.197:8089/login/action/iframepage/initConfigPage?code=a4f7c2eb075b4da3afc6f87fa589c011&pageTitle=新制品管理

export default function () {
  if (location.origin + location.pathname === 'http://172.16.0.197:8089/login/action/iframepage/initConfigPage') {
    Object.defineProperty(window, 'navDatas', {
      get() {
        return this._navDatas
      },
      set(val) {
        if (val && val[0].menuname !== 'menuname') {
          val.unshift({
            icon: 'ci-productbuild',
            isvisible: true,
            menuname: '自定义菜单',
            sortNo: 0,
            subMenuList: [
              {
                fyname: '持续集成',
                icon: 'ci-productbuild',
                id_classify: '4b4ec44fa8434a5280310e190b16e30c',
                isvisible: true,
                menuid: '356b1bbdb455459dade939931352e101',
                menuname: '产品构建(新)',
                menuurl: '/cloud/pango-dist/index.html?type=page&id=productBaseBuild&ctxPath=probuild&pathOverride=true',
                sortNo: 2
              },
              {
                fyname: '发布中心',
                icon: 'product-manager',
                id_classify: 'ef64f76d1c1f4c80a3e4fd92eddb5064',
                isvisible: true,
                menuid: '3a75ba5a787a44fea970f73f1c111674',
                menuname: '产品制品',
                menuurl: '/login/app/win/products',
                sortNo: 4
              }
            ]
          })
        }
        if (val !== this._navDatas) {
          window._navDatas = val
        }
      }
    })
  }
}
