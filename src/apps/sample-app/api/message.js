/** 对齐 Arco Pro mock：/api/chat/list */
export async function queryChatList() {
  return {
    data: [
      {
        id: 1,
        username: '用户7352772',
        content: '马上就开始了，好激动！',
        time: '13:09:12',
        isCollect: true
      },
      {
        id: 2,
        username: '用户889012',
        content: '画质可以再调高一点吗？',
        time: '13:10:05',
        isCollect: false
      },
      {
        id: 3,
        username: '用户102938',
        content: '收到，感谢主播！',
        time: '13:11:22',
        isCollect: true
      },
      {
        id: 4,
        username: '用户556677',
        content: '666666',
        time: '13:12:01',
        isCollect: false
      }
    ]
  }
}
