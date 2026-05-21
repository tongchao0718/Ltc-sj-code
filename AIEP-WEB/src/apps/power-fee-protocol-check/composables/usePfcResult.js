import { Message } from '@arco-design/web-vue';

/**
 * 统一处理后端 { code, message, data, requestId } 响应。
 * 成功返回 data；失败提示并返回 null。
 */
export function pickData(res, errPrefix = '') {
  if (res == null) {
    Message.error(`${errPrefix}无响应`.trim());
    return null;
  }
  if (typeof res.code !== 'undefined' && res.code !== 0) {
    Message.error(`${errPrefix}${res.message || '业务失败'}`.trim());
    return null;
  }
  return res.data ?? null;
}

export function toastOk(msg) {
  Message.success(msg);
}

export function toastInfo(msg) {
  Message.info(msg);
}
