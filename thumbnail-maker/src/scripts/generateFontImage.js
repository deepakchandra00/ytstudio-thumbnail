const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const apiKey = "AIzaSyDRLIWls3GhN3MWqLJnWMJPkUvta-XHsfA"; // Replace with your actual API key
const imagesDir = path.join(__dirname, "font-images");

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

async function generateFontImage(font) {
    const fontName = font.family.replace(/\s+/g, "-");
    const imagePath = path.join(imagesDir, `${fontName}.png`);

    if (fs.existsSync(imagePath)) {
        console.log(`Image already exists for ${font.family}`);
        return;
    }

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        const fontImportUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
            font.family
        )}:wght@400&display=swap`;

        await page.setContent(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Font Preview</title>
                <link rel="stylesheet" href="${fontImportUrl}">
                <style>
                    body { margin: 0; background-color: white; }
                    canvas { display: block; }
                </style>
            </head>
            <body>
                <canvas id="canvas" width="300" height="100"></canvas>
                <script>
                    async function renderCanvas(fontFamily) {
                        return new Promise((resolve) => {
                            const canvas = document.getElementById('canvas');
                            const ctx = canvas.getContext('2d');

                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);

                            ctx.font = "36px " + fontFamily;
                            ctx.fillStyle = 'black';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';

                            // Ensure the font is loaded
                            document.fonts.load(ctx.font).then(() => {
                                ctx.fillText(fontFamily, canvas.width / 2, canvas.height / 2);
                                console.log("Rendered font:", fontFamily);
                                resolve();
                            });
                        });
                    }
                </script>
            </body>
            </html>
        `);

        await page.waitForFunction(() => document.fonts.ready);

        await page.evaluate(async (fontFamily) => {
            await window.renderCanvas(fontFamily);
        }, font.family);

        const canvasBuffer = await page.screenshot({
            clip: { x: 0, y: 0, width: 300, height: 100 },
            encoding: "binary",
        });

        fs.writeFileSync(imagePath, canvasBuffer);
        console.log(`Generated image for ${font.family}`);

        await browser.close();
    } catch (error) {
        console.error(`Error generating image for ${font.family}:`, error.message);
    }
}
async function fetchAndGenerateFonts() {
    try {
        const response = await axios.get(
            `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`
        );
        const fonts = response.data.items;

        for (const font of fonts) {
            await generateFontImage(font);
        }

        console.log("All font images generated.");
    } catch (error) {
        console.error("Error fetching fonts:", error.message);
    }
}

fetchAndGenerateFonts();