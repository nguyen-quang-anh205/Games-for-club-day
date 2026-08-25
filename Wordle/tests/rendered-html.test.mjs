import assert from "node:assert/strict";
import test from "node:test";

test("renders the Cyber Wordle mission entry screen", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /CYBER WORDLE/i);
  assert.match(html, /Decode three five-letter English words/i);
  assert.match(html, /USTH PROTOCOL/i);
  assert.match(html, /6<\/b> MAX GUESSES/i);
  assert.match(html, /3<\/b> FLAG FRAGMENTS/i);
  assert.match(html, /BEGIN MISSION/i);
});
