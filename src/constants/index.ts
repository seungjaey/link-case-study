import { CommonConstantItem } from '../types';

export const TARGET_URL_LIST: CommonConstantItem[] = [
  {
    name: 'Kurly Firebase DeepLink',
    value: 'https://goods.kurly.it/pmL1',
  },
  {
    name: 'Slack message link',
    value: 'https://marketkurly.slack.com/archives/C02SPPUDNMU/p1690419601533099',
  },
  {
    name: 'Coupang Product Detail',
    value: 'https://link.coupang.com/a/46fSp',
  },
  {
    name: '11St Product Detail',
    value: 'http://www.11st.co.kr/products/5840312046/share',
  },
  {
    name: '무신사',
    value: 'https://musinsaapp.page.link/QAxENMJZgMdZyZs86',
  },
];

export const ANDROID_USER_AGENT_LIST: CommonConstantItem[] = [
  {
    name: 'Samsung Galaxy S20 Ultra',
    value:
      'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
  },
];

export const IOS_USER_AGENT_LIST: CommonConstantItem[] = [
  {
    name: 'iPhone 12 Pro',
    value:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
  },
];

export const WEB_USER_AGENT_LIST: CommonConstantItem[] = [
  {
    name: 'macOS 12.3',
    value:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  },
];

export default {
  TARGET_URL_LIST,
  ANDROID_USER_AGENT_LIST,
  IOS_USER_AGENT_LIST,
  WEB_USER_AGENT_LIST,
};
