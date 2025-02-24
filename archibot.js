require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const puppeteer = require("puppeteer");
const proxyChain = require("proxy-chain");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Proxy zoznam
const PROXIES = [
    "boilinggeo.boilingproxies.com:10000:pxy_hjc3pw4k-country-sk-session-d7annt2j-lifetime-60:4aa223a1-f1c4-4fcf-ac2a-a1b7e75e2d00",
    "boilinggeo.boilingproxies.com:10000:pxy_hjc3pw4k-country-sk-session-exeu1kxq-lifetime-60:4aa223a1-f1c4-4fcf-ac2a-a1b7e75e2d00",
    "boilinggeo.boilingproxies.com:10000:pxy_hjc3pw4k-country-sk-session-ou2kpsey-lifetime-60:4aa223a1-f1c4-4fcf-ac2a-a1b7e75e2d00",
    "boilinggeo.boilingproxies.com:10000:pxy_hjc3pw4k-country-sk-session-tt2oh42a-lifetime-60:4aa223a1-f1c4-4fcf-ac2a-a1b7e75e2d00",
    "boilinggeo.boilingproxies.com:10000:pxy_hjc3pw4k-country-sk-session-hyhj6l8u-lifetime-60:4aa223a1-f1c4-4fcf-ac2a-a1b7e75e2d00"
];

async function getProxy() {
  return PROXIES[Math.floor(Math.random() * PROXIES.length)];
}

async function loginToWebsite(url, email, password) {
  let proxy = await getProxy();
  let anonymizedProxy = await proxyChain.anonymizeProxy(proxy);
  console.log(`Používam proxy: ${proxy}`);

  const browser = await puppeteer.launch({
    headless: true, // Ak chceš vidieť, nastav false
    args: [`--proxy-server=${anonymizedProxy}`],
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForNavigation();

    let currentURL = page.url();
    await browser.close();
    await proxyChain.closeAnonymizedProxy(anonymizedProxy);

    if (currentURL.includes("dashboard")) {
      return "✅ Prihlásenie úspešné!";
    } else {
      return "❌ Prihlásenie neúspešné!";
    }
  } catch (error) {
    await browser.close();
    await proxyChain.closeAnonymizedProxy(anonymizedProxy);
    return `⚠ Chyba: ${error.message}`;
  }
}

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("/login")) return;

  const args = message.content.split(" ");
  if (args.length < 4) {
    message.reply("❌ Použitie: `/login <url> <email> <heslo>`");
    return;
  }

  const url = args[1];
  const email = args[2];
  const password = args[3];

  message.reply(`🔄 Prihlasujem sa na ${url}...`);
  const result = await loginToWebsite(url, email, password);
  message.reply(result);
});

client.once("ready", () => {
  console.log(`✅ Bot je online!`);
});

client.login(process.env.TOKEN);