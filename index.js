import fs from "fs-extra";
import puppeteer from "puppeteer";

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
  // headless: false,
  // args: ["--start-maximized"],
  args: [`--window-size=1920,1080`],
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
});
const page = await browser.newPage();
await page.goto(
  "https://careers.tencent.com/search.html?query=ot_40001001,ot_40001005,co_1&sc=1"
);
let switchPageLiArr = await page.$$(".page-li");
let pageTotal = await switchPageLiArr[switchPageLiArr.length - 1].evaluate(
  (node) => node.innerText
);
pageTotal = parseInt(pageTotal);
console.log(`pageTotal`, pageTotal);
// pageTotal = 3;
const pageUrls = Array.from({ length: pageTotal })
  .map((v, k) => k + 1)
  .map((n) => getUrl(n));
pageUrls.pop();
console.log(`pageUrls`, pageUrls);

let postIds = await Promise.all(
  pageUrls.map(async (url, index) => {
    const newPage = await browser.newPage();
    await sleep(3 * index);
    // await sleep(3);
    await newPage.goto(url);
    await sleep(3);
    const shareButtons = Array.from(await newPage.$$(".share-title"));
    let postIds = shareButtons.map((button) => {
      return button.evaluate(
        (node) => node.nextElementSibling.nextElementSibling.id
      );
    });
    postIds = await Promise.all(postIds);
    // postIds = postIds.map((postId) => parseInt(postId));
    console.log(`postIds`, postIds);
    await newPage.close();
    return postIds;
  })
);
postIds = postIds.flat();
console.log(`postIds`, postIds);

const contents = [];
const getContent = async (url) => {
  const subPage = await browser.newPage();
  await subPage.goto(url);
  await sleep(1);

  const contentElement = Array.from(await subPage.$$(".recruit-content"))[0];
  const contentText = await contentElement.evaluate((node) => node.innerText);
  await subPage.close();
  return contentText;
};
for (const postId of postIds) {
  const postUrl = getPostUrl(postId);
  console.log(`postUrl`, postUrl);
  // await sleep(10 * i);
  let contentText;
  while (!contentText) {
    try {
      contentText = await getContent(postUrl);
    } catch (error) {
      console.log(`postUrl`, postUrl);
      console.error(error);
    }
  }
  contents.push(contentText);
}
console.log(contents);
fs.writeFileSync("./output.txt", contents.join("~".repeat(20)));
// console.log(postIds);

await browser.close();
