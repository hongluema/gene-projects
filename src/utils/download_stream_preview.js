// 流式处理预览（适合大文件）
async function streamPreview() {
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

// streamPreview()