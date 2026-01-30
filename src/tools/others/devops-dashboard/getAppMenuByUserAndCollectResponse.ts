export default function getAppMenuByUserAndCollectResponse(appMenu: [{ children: any[] }]) {
  return appMenu.map((menu: { children: any[] }) => {
    menu.children = menu.children.map((child) => {
      child.enable = true
      return child
    })
    return menu
  })
}
