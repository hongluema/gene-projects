async function downloadAndPreviewDirectly() {
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
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    // 获取二进制数据流
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

    // 直接创建预览URL
    const previewUrl = URL.createObjectURL(blob);
    
    // 打开预览
    openPreview(previewUrl, filename, blob);

  } catch (error) {
    console.error('错误:', error);
    alert('文件加载失败');
  }
}

// 预览功能
function openPreview(previewUrl, filename, blob) {
  // 创建预览弹窗
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
    <h3>预览: ${filename}</h3>
    <div>
      <button id="downloadBtn" style="margin-right: 10px;">下载</button>
      <button id="closeBtn">关闭</button>
    </div>
  `;

  // 创建预览区域
  const previewArea = document.createElement('div');
  previewArea.style.cssText = `
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f5f5f5;
  `;

  // 根据文件类型选择预览方式
  if (filename.toLowerCase().endsWith('.pdf')) {
    // PDF 预览
    const iframe = document.createElement('iframe');
    iframe.src = previewUrl;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;
    previewArea.appendChild(iframe);
  } else if (filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    // 图片预览
    const img = document.createElement('img');
    img.src = previewUrl;
    img.style.cssText = `
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    `;
    previewArea.appendChild(img);
  } else if (filename.toLowerCase().match(/\.(txt|json|xml|csv)$/)) {
    // 文本文件预览
    const textArea = document.createElement('textarea');
    textArea.style.cssText = `
      width: 100%;
      height: 100%;
      border: 1px solid #ddd;
      padding: 10px;
      font-family: monospace;
      resize: none;
    `;
    
    // 读取文本内容
    const reader = new FileReader();
    reader.onload = function(e) {
      textArea.value = e.target.result;
    };
    reader.readAsText(blob);
    
    previewArea.appendChild(textArea);
  } else {
    // 其他文件类型
    previewArea.innerHTML = `
      <div style="text-align: center;">
        <p>不支持在线预览此文件类型</p>
        <p>请下载后查看</p>
      </div>
    `;
  }

  content.appendChild(header);
  content.appendChild(previewArea);
  modal.appendChild(content);
  document.body.appendChild(modal);

  // 事件处理
  document.getElementById('downloadBtn').onclick = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = previewUrl;
    downloadLink.download = filename;
    downloadLink.click();
  };

  document.getElementById('closeBtn').onclick = () => {
    document.body.removeChild(modal);
    URL.revokeObjectURL(previewUrl); // 清理URL
  };

  // 点击背景关闭
  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
      URL.revokeObjectURL(previewUrl);
    }
  };
}

// 调用
// downloadAndPreviewDirectly();