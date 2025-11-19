async function downloadReport(pk) {
  try {
    const response = await fetch(`/api/remote/report/pdf?pk=${pk}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }
    
    // 获取文件 blob
    const blob = await response.blob();
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '样本.pdf'; // 文件名，浏览器会优先使用后端返回的文件名
    document.body.appendChild(a);
    a.click();
    
    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('下载成功');
  } catch (error) {
    console.error('下载失败:', error);
    alert('下载失败，请稍后重试');
  }
}

// 使用示例
// downloadReport('375766785955336192');