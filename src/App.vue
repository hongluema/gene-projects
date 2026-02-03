<script setup>
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useAuth } from "@/composables/useAuth";

onLaunch(async () => {
  console.log("App Launch");
  
  // 初始化登录状态
  const { initAuth, isLogin, isProfileComplete } = useAuth();
  await initAuth();
  
  console.log('[App] Auth state:', {
    isLogin: isLogin.value,
    isProfileComplete: isProfileComplete.value
  });
  
  // 检查登录态
  // 注意：不在这里做路由跳转，因为页面还没加载
  // 路由守卫在各个页面的 onLoad 中处理
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});
</script>
<style></style>
