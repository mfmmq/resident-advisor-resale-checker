import * as request from 'request-promise-native';
import { prompt, ChoiceType } from 'inquirer';
import { notify } from 'node-notifier';
import * as cheerio from 'cheerio';

const questions = [
  {
    type: 'input',
    name: 'url',
    message: 'URL to check:',
    default: () => 'https://www.residentadvisor.net/events/1422121',
  },
  {
    type: 'input',
    name: 'interval',
    message: 'Check interval (seconds)',
    default: () => 20,
    validate: val => !isNaN(parseInt(val)),
  },
];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function check(url: string, interval: number) {
  try {
    console.time('fetched page in');
    const body = await request(url);
    console.timeEnd('fetched page in');

    const $ = cheerio.load(body);
    const $li = $('li', '#tickets ul');
    $li.each((index, element) => {
      const $el = $(element);
      if ($el.hasClass('onsale')) {
        notify({
          title: 'TICKETS AVAILABLE!',
          message: 'buy tickets now',
        });

        console.log(`Tickets available! GO GO GO 👉  ${url}`);
      }
    });
  } catch (err) {
    console.log(err);
    notify({
      title: 'ERROR',
      message: err.message,
    });
  }

  await wait(interval);

  check(url, interval);
}

async function main() {
  const answers = await prompt(questions);
  const { interval, url } = answers as { [key: string]: string };

  const body = await request(url);

  const $ = cheerio.load(body);

  notify({
    title: 'Starting crawler...',
    message: `Watching tickets now`,
  });

  console.log(`Started crawling, will check site every ${interval} seconds.`);
  console.log(
    "You should see a notification now. If you don't, something is wrong 😿.",
  );
  await check(url, parseInt(interval) * 1000);
}

main();
