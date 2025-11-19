async function streamPreview() {
  try {
    const response = await fetch('/api/report/pdf?pk=375766785955336192', {
      method: 'GET',
    });

    if (!response.ok) throw new Error('请求失败');

    // 创建预览窗口（先显示加载中）
    const previewUrl = URL.createObjectURL(await response.blob());
    
    // 在新窗口打开预览
    const previewWindow = window.open(previewUrl, '_blank');
    
    // 或者嵌入当前页面
    // const iframe = document.createElement('iframe');
    // iframe.src = previewUrl;
    // document.body.appendChild(iframe);

  } catch (error) {
    console.error('错误:', error);
  }
}
streamPreview()