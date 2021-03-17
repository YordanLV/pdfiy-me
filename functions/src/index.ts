import * as puppeteer from "puppeteer";
import * as functions from "firebase-functions";

async function autoScroll(page: puppeteer.Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
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

export const exportPDF = functions
  .runWith({ memory: "1GB" })
  .https.onRequest(async (request, response) => {
    // @ts-ignore
    const { url, tag }: { url: string, tag: string } = request.query;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' }); // Adjust network idle as required.

    const pdfConfig = {
      format: 'A4',
      printBackground: true
    };

    page.on('response', async response => {
      const style = await response.text();
      console.log(style);
    });

    if (tag) {
      await page.evaluate((selectedTag) => {
        const selectedElement = document.querySelector(selectedTag).innerHTML;
        // @ts-ignore
        document.querySelector('body').innerHTML = selectedElement;
      }, ".scrollable-block-wrapper"); // Get DOM HTML
    }

    await page.emulateMediaType('screen');
    await autoScroll(page);
    // @ts-ignore
    const pdf = await page.pdf(pdfConfig); // Return the pdf buffer. Useful for saving the file not to disk. 

    await browser.close();

    response.contentType("application/pdf");
    response.send(pdf);
  });


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
