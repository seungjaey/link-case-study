import puppeteer, { Browser } from 'puppeteer';
import { pipe, map, toArray } from '@fxts/core';

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

    // Navigate the page to a URL
    const response = await page.goto('https://www.kurly.com/');
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
            headers: redirect.headers(),
          },
        ];
      }),
      toArray,
    );
    console.log(JSON.stringify(result));
  });
};

run();
