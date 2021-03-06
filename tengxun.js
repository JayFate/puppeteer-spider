import fs from "fs-extra";
import puppeteer from "puppeteer";

// https://jobs.bytedance.com/experienced/position?keywords=&category=&location=&project=&type=&job_hot_flag=&current=1&limit=10&functionCategory=
// https://jobs.bytedance.com/experienced/position?keywords=&category=6704215862603155720%2C6704215862557018372%2C6704215886108035339%2C6704215888985327886%2C6704215897130666254%2C6704215956018694411%2C6704215957146962184%2C6704215958816295181%2C6704215963966900491%2C6704216109274368264%2C6704216296701036811%2C6704216635923761412%2C6704217321877014787%2C6704219452277262596%2C6704219534724696331%2C6938376045242353957&location=&project=&type=&job_hot_flag=&current=1&limit=10&functionCategory=
// https://jobs.bytedance.com/experienced/position?keywords=&category=6704215862603155720%2C6704215862557018372%2C6704215886108035339%2C6704215888985327886%2C6704215897130666254%2C6704215956018694411%2C6704215957146962184%2C6704215958816295181%2C6704215963966900491%2C6704216109274368264%2C6704216296701036811%2C6704216635923761412%2C6704217321877014787%2C6704219452277262596%2C6704219534724696331%2C6938376045242353957&location=&project=&type=&job_hot_flag=&current=2&limit=10&functionCategory=

// https://jobs.bytedance.com/experienced/position/7098224474646137095/detail?use_ssr=1
// https://jobs.bytedance.com/experienced/position/7065536328469137695/detail?use_ssr=1
const getUrl = (n) =>
  `https://careers.tencent.com/search.html?query=co_1,ot_40001001,ot_40001005&index=${n}&sc=1`;

const getPostUrl = (postId) =>
  `https://careers.tencent.com/jobdesc.html?postId=${postId}`;

const sleep = async (timeout = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout * 1000);
  });
};

const browser = await puppeteer.launch({
  headless: false,
  // args: ["--start-maximized"],
  args: [`--window-size=1920,1080`],
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
});
const page = await browser.newPage();
await page.goto(getUrl(1));
let switchPageLiArr = await page.$$(".page-li");
let pageTotal = await switchPageLiArr[switchPageLiArr.length - 1].evaluate(
  (node) => node.innerText
);
pageTotal = parseInt(pageTotal);
console.log(`pageTotal`, pageTotal);
// pageTotal = 3;
let pageUrls = Array.from({ length: pageTotal })
  .map((v, k) => k + 1)
  .map((n) => getUrl(n));
pageUrls.pop();
// console.log(`pageUrls`, pageUrls);

// pageUrls = get2Arr(pageUrls, 10);

let postIds = [];

postIds = fs.readJsonSync("./postIds.json");
console.log(`pageUrls`, pageUrls);

// for (const pageUrl of pageUrls) {
//   await page.goto(pageUrl);
//   await sleep(0.5);
//   const aTags = Array.from(await page.$$(".share-title")); // listItems__1q9i5
//   let ids = aTags.map((button) => {
//     return button.evaluate(
//       (node) => node.nextElementSibling.nextElementSibling.id
//     );
//   });
//   ids = await Promise.all(ids);
//   // postIds = postIds.map((postId) => parseInt(postId));
//   console.log(`ids`, ids);
//   postIds = postIds.concat(ids);
// }

console.log(`postIds`, postIds);
fs.writeJsonSync("./postIds.json", postIds, { encoding: "utf8" });

const contents = [];

const len = 20;
const tempArr = Array.from({ length: len }).map((v, k) => k);
const length = parseInt(postIds.length / len) + 1;

await Promise.all(
  tempArr.map(async (i) => {
    console.log(`i`, i);
    const _postIds = postIds.slice(i * length, (i + 1) * length);
    let subPage = await browser.newPage();
    const getContent = async (url) => {
      console.log(`getContent url`, url);
      // subPage = await browser.newPage();
      await subPage.goto(url);
      await sleep(1);

      const contentElement = Array.from(
        await subPage.$$(".recruit-content")
      )[0];
      const contentText = await contentElement.evaluate(
        (node) => node.innerText
      );
      // await subPage.close();
      return contentText;
    };

    for (const postId of _postIds) {
      const postUrl = getPostUrl(postId);
      console.log(`postUrl`, postUrl);
      // await sleep(10 * i);
      let contentText;
      let counter = 0;
      while (!contentText && counter < 10) {
        try {
          contentText = await getContent(postUrl);
        } catch (error) {
          console.log(`postUrl`, postUrl);
          console.log(`counter`, counter++);
          console.log(error);
        }
      }
      console.log(`contentText\n\n`, contentText);
      contentText = contentText || "";
      contentText = contentText
        .replace(/(\d)+???/gm, `$1. `)
        .replace(/^-[^ ]/gm, "- ");

      let counter1 = 0;
      contentText = contentText
        .split("\n")
        .map((str) => {
          if (str.match(/^- /)) {
            str = str.replace(/^- /, `${counter1++}. `);
          } else {
            counter1 = 0;
          }
          return str;
        })
        .join("\n");
      contents.push(contentText + `\n\npostId:${postId}\n\n`);
    }
  })
);
console.log(`contents:`);
console.log(contents);
fs.writeFileSync(
  "./tenguxn.txt",
  contents.join("\n\n" + "~".repeat(20) + "\n\n")
);
// console.log(postIds);

await browser.close();
