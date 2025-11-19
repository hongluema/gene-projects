async function downloadFile() {
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

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 释放URL对象
    window.URL.revokeObjectURL(url);
    
    console.log('文件下载成功');
  } catch (error) {
    console.error('下载错误:', error);
    alert('文件下载失败，请重试');
  }
}

// 调用下载函数
downloadFile();