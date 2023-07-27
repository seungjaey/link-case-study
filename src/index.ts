import { writeFile } from 'fs/promises';
import axios, { Axios, AxiosError } from 'axios';
import { pipe, map, toArray, toAsync, take, flat, concurrent } from '@fxts/core';

import { TARGET_URL_LIST, WEB_USER_AGENT_LIST, IOS_USER_AGENT_LIST, ANDROID_USER_AGENT_LIST } from './constants';
import { AnalysisTargetDataItem } from './types';
import { get } from 'lodash';

const httpClient = axios.create({
  // NOTE: no follow redirect
  maxRedirects: 0,
});

const getAnalysisTargetDataSet = (): AnalysisTargetDataItem[] =>
  pipe(
    [ANDROID_USER_AGENT_LIST, WEB_USER_AGENT_LIST, IOS_USER_AGENT_LIST],
    flat,
    map(({ name, value }) => ({
      deviceName: name,
      userAgent: value,
    })),
    map((item) =>
      pipe(
        TARGET_URL_LIST,
        map(({ name, value }) => ({
          ...item,
          targetOriginalName: name,
          targetOriginalUrl: value,
        })),
        toArray,
      ),
    ),
    flat,
    toArray,
  );

const checkRedirectStatus = (status: number) => status >= 300 && status < 400;

// @ts-ignore
const followRedirect = async (link: string, userAgent: string, attempts: any[] = []) => {
  const nextAttempts = [...attempts];
  try {
    const { status, headers } = await httpClient.get(link, {
      headers: {
        'user-agent': userAgent,
      },
    });
    const locationHeader = headers['location'];
    const isRedirect = checkRedirectStatus(status);

    nextAttempts.push({ from: link, to: locationHeader, userAgent, status });
    if (isRedirect) {
      return followRedirect(locationHeader, userAgent, nextAttempts);
    }
    return nextAttempts;
  } catch (error) {
    nextAttempts.push({ from: link, to: get(error, 'response.headers.location', 'error'), userAgent, status: -1 });
    return nextAttempts;
  }
};

const run = async () => {
  const analysisTargetData = getAnalysisTargetDataSet();
  const final = await pipe(
    analysisTargetData,
    toAsync,
    map(async (item) => {
      const { targetOriginalUrl, userAgent } = item;
      const result = await followRedirect(targetOriginalUrl, userAgent);
      return {
        ...item,
        result,
      };
    }),
    concurrent(5),
    toArray,
  );
  console.log('final');
  await writeFile('./OUTPUT.json', JSON.stringify(final));
};

run();
