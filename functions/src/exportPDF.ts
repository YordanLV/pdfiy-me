import * as puppeteer from "puppeteer";

async function autoScroll(page: puppeteer.Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve, _reject) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}

export const exportPDF = async (url: string, tag?: string, landscape?: boolean) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const pdfConfig = {
    format: "A4",
    printBackground: true,
    landscape: landscape ? true : false,
  };

  if (tag) {
    await page.evaluate((selectedTag) => {
      const selectedElement = document.querySelector(selectedTag).innerHTML;
      // @ts-ignore
      document.querySelector("body").innerHTML = selectedElement;
    }, tag); // Get DOM HTML
  }

  await page.emulateMediaType("screen");
  await autoScroll(page);
  // @ts-ignore
  const pdf = await page.pdf(pdfConfig);

  await browser.close();

  return pdf;
};
