<template>
  <div>
    <logo :collapse="isCollapse" />
    <el-menu
    :default-active="activeMenu"
    :collapse="isCollapse"
    :background-color="variables.menuBg"
    :text-color="variables.menuText"
    :unique-opened="false"
    :active-text-color="variables.menuActiveText"
    :collapse-transition="false"
    mode="vertical"
  >
    <sidebar-item v-for="route in permission_routes" :key="route.path" :item="route" :base-path="route.path" />
  </el-menu>
  </div>
</template>

<script>
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

export default {
  components: {
    SidebarItem,
    Logo
  },
  computed: {
    permission_routes () {
      return this.$store.state.permission.routes
    },
    variables () {
      return variables
    },
    activeMenu () {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    isCollapse () {
      return !this.$store.state.app.sidebar.opened
    }
  }
}
</script>
