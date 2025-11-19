// 使用 IndexedDB 存储文件（适合大文件）
async function downloadAndStoreInDB() {
  try {
    const response = await fetch('http://117.149.9.79:9003/api/pdf/download?pk=375766785955336192', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoieGN4amsiLCJwayI6IjM3MTQxMTg0Mzg4NzAwOTc5MiIsInNjb3BlcyI6IltcIm9yZGVyczpjcmVhdGVcIiwgXCJvcmdfYW5kX2N1c3RvbWVyczpjcmVhdGVcIiwgXCJzYW1wbGU6Y3JlYXRlXCIsIFwic2FtcGxlX2FuZF9wcm9ncmFtOmNyZWF0ZVwiLCBcImFwaXVzZXI6Y3JlYXRlXCIsIFwiYXBpdXNlcjp1cGRhdGVcIiwgXCJhcGl1c2VyOmRlbGV0ZVwiLCBcImFwaXVzZXI6cmV0cmlldmVcIl0iLCJzdXBlciI6MCwiZXhwIjoxNzY0NDA3MjEwfQ.vty8xc2js62YI_6c3wO6vWUhb5htVL-pqRQ_4skRVXs',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) throw new Error('下载失败');

    const blob = await response.blob();
    
    // 获取文件名
    let filename = 'document.pdf';
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename\*?=["']?(?:UTF-8'')?([^;"']+)["']?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1]);
      }
    }

    // 1. 下载到用户设备
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(downloadUrl);

    // 2. 存储文件信息供后续预览
    const fileInfo = {
      filename: filename,
      timestamp: new Date().toISOString(),
      size: blob.size
    };
    
    localStorage.setItem('last_downloaded_file', JSON.stringify(fileInfo));
    
    // 将文件保存到临时存储
    sessionStorage.setItem(`temp_file_${filename}`, URL.createObjectURL(blob));
    
    console.log('文件已下载并保存，可以随时预览');
    
    // 提供预览按钮或自动预览
    setTimeout(() => {
      if (confirm('文件下载完成！是否立即预览？')) {
        previewStoredFile(filename);
      }
    }, 1000);

  } catch (error) {
    console.error('错误:', error);
  }
}

// 预览存储的文件
function previewStoredFile(filename) {
  const fileUrl = sessionStorage.getItem(`temp_file_${filename}`);
  
  if (!fileUrl) {
    alert('文件未找到，请重新下载');
    return;
  }

  // 创建预览窗口
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  modal.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 8px; width: 90%; height: 90%; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <h3>预览: ${filename}</h3>
        <button onclick="this.closest('div').parentElement.remove()">关闭</button>
      </div>
      <iframe src="${fileUrl}" style="flex: 1; border: none;"></iframe>
    </div>
  `;

  document.body.appendChild(modal);
}

// 使用示例
// downloadAndStoreInDB();