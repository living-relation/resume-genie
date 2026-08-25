const BASE = "https://resume-genie-hztn.onrender.com";
const jar = {};

async function req(method, path, body, bin = false) {
  const headers = { "Content-Type": "application/json" };
  if (Object.keys(jar).length) {
    headers.Cookie = Object.entries(jar)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookies = typeof r.headers.getSetCookie === "function" ? r.headers.getSetCookie() : [];
  for (const c of setCookies) {
    const [kv] = c.split(";");
    const i = kv.indexOf("=");
    if (i > 0) jar[kv.slice(0, i)] = kv.slice(i + 1);
  }
  if (bin) {
    const buf = Buffer.from(await r.arrayBuffer());
    return { status: r.status, buf, ctype: r.headers.get("content-type") };
  }
  const text = await r.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: r.status, json };
}

const health = await req("GET", "/api/healthz");
console.log("1 health", health.status, health.json);

const doc = await req("POST", "/api/documents", {
  name: "Smoke Resume",
  type: "resume",
  content:
    "Jane Doe\nSoftware Engineer\n\nEXPERIENCE\nAcme Corp — Software Engineer (2020-2024)\n- Built REST APIs in Node.js and Express\n- Shipped React dashboards used by 5k users\n\nSKILLS\nJavaScript, TypeScript, Node.js, React, PostgreSQL",
});
console.log("2 document", doc.status, doc.json?.id);
if (doc.status !== 201) {
  console.error(doc);
  process.exit(1);
}

const job = await req("POST", "/api/jobs", {
  title: "Full Stack Engineer",
  company: "Example Co",
  location: "Remote",
  description:
    "We need a Full Stack Engineer with Node.js, React, and PostgreSQL. Own APIs and UI. 3+ years experience.",
});
console.log("3 job", job.status, job.json?.id, job.json?.status);
if (job.status !== 201) {
  console.error(job);
  process.exit(1);
}

const app = await req("POST", "/api/applications", {
  jobId: job.json.id,
  tone: "professional",
  style: "concise",
  truthfulness: 1,
});
console.log("4 generate", app.status, app.json?.id, app.json?.status);
if (app.status !== 201) {
  console.error(app);
  process.exit(1);
}

let final = null;
for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  final = await req("GET", `/api/applications/${app.json.id}`);
  console.log("5 poll", i + 1, final.json?.status);
  if (final.json?.status === "done" || final.json?.status === "failed") break;
}

if (!final?.json || final.json.status !== "done") {
  console.error("generation failed", final);
  process.exit(1);
}

console.log(
  "resume chars",
  (final.json.resume || "").length,
  "cover chars",
  (final.json.coverLetter || "").length,
);

const exp = await req(
  "POST",
  `/api/applications/${app.json.id}/export`,
  {
    layout: "classic",
    docType: "resume",
    profile: {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "555-0100",
      location: "Remote",
    },
  },
  true,
);
const isDocx = exp.buf?.[0] === 0x50 && exp.buf?.[1] === 0x4b;
console.log("6 export", exp.status, exp.ctype, "bytes", exp.buf?.length, "docx?", isDocx);
if (exp.status !== 200 || !exp.buf || exp.buf.length < 1000 || !isDocx) {
  process.exit(1);
}

console.log("SMOKE_OK");
