// 先下载到本地，然后读取本地文件进行预览
async function downloadThenPreview() {
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

    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }

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

    // 1. 先下载到用户设备
    const downloadUrl = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = filename;
    downloadLink.click();
    window.URL.revokeObjectURL(downloadUrl);

    // 2. 同时保存到本地存储供后续预览
    const reader = new FileReader();
    reader.onload = function(e) {
      // 保存到 localStorage
      localStorage.setItem(`preview_${filename}`, e.target.result);
      localStorage.setItem(`preview_filename`, filename);
      
      // 询问用户是否立即预览
      if (confirm('文件下载完成！是否立即预览？')) {
        previewFromLocalStorage(filename);
      }
    };
    reader.readAsDataURL(blob);

  } catch (error) {
    console.error('下载错误:', error);
    alert('文件下载失败');
  }
}

// 从本地存储预览文件
function previewFromLocalStorage(filename = null) {
  const fileKey = filename ? `preview_${filename}` : Object.keys(localStorage).find(key => key.startsWith('preview_'));
  
  if (!fileKey) {
    alert('没有找到可预览的文件');
    return;
  }

  const fileData = localStorage.getItem(fileKey);
  const filenameStored = localStorage.getItem('preview_filename') || 'document.pdf';

  // 创建预览窗口
  const previewUrl = fileData; // data URL 可以直接用于预览
  
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
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    height: 90%;
    display: flex;
    flex-direction: column;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;
    border-bottom: 1px solid #eee;
  `;

  header.innerHTML = `
    <h3>预览: ${filenameStored}</h3>
    <div>
      <button id="closePreviewBtn">关闭</button>
    </div>
  `;

  const iframe = document.createElement('iframe');
  iframe.src = previewUrl;
  iframe.style.flex = '1';
  iframe.style.border = 'none';

  content.appendChild(header);
  content.appendChild(iframe);
  modal.appendChild(content);
  document.body.appendChild(modal);

  document.getElementById('closePreviewBtn').onclick = () => {
    document.body.removeChild(modal);
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  };
}

// 检查是否有已下载的文件可以预览
function checkStoredFiles() {
  const previewFiles = Object.keys(localStorage).filter(key => key.startsWith('preview_'));
  if (previewFiles.length > 0) {
    if (confirm(`发现 ${previewFiles.length} 个已下载文件，是否预览？`)) {
      previewFromLocalStorage();
    }
  }
}

// 页面加载时检查是否有存储的文件
// checkStoredFiles();