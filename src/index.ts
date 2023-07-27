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

/* V1 = puppeteer approach
type WithBrowserCallback = (browser: Browser) => void;

const withBrowser = async (f: WithBrowserCallback) => {
  const browser = await puppeteer.launch();
  try {
    f(browser);
  } catch (error) {
    await browser.close();
  }
};
const run = async () => {
  await withBrowser(async (browser) => {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (request.isNavigationRequest() && request.redirectChain().length !== 0) {
        console.log(`redirect...`);
        request.response()?.headers()?.location;
      }
      request.continue();
    });

    try {
      // Navigate the page to a URL
      await page.setUserAgent(ANDROID_USER_AGENT_LIST[0].value);
      const response = await page.goto(TARGET_URL_LIST[0].value);
      if (!response) {
        throw new Error('Request Failed');
      }
      const redirectChain = response.request().redirectChain();
      const result = pipe(
        redirectChain,
        map((redirect) => {
          return [
            redirect.url(),
            {
              method: redirect.method(),
              status: redirect?.response()?.status(),
              location: redirect?.response()?.headers().location,
            },
          ];
        }),
        toArray,
      );
      console.log(JSON.stringify(result));
    } catch (error) {
      console.log('page error');
      console.log(error);
    }
    await browser.close();
  });
};
*/

run();
