import crypto from "crypto";

const region = "us-east-1";
const service = "ProductAdvertisingAPI";
const host = "webservices.amazon.in";

function hmac(key, str) {
  return crypto.createHmac("sha256", key).update(str).digest();
}

function hash(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

export function sign(payload) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  const canonicalURI = "/paapi5/getitems";
  const canonicalQuery = "";
  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n`;

  const signedHeaders =
    "content-encoding;content-type;host;x-amz-date";

  const payloadHash = hash(JSON.stringify(payload));

  const canonicalRequest =
    "POST\n" +
    canonicalURI +
    "\n" +
    canonicalQuery +
    "\n" +
    canonicalHeaders +
    "\n" +
    signedHeaders +
    "\n" +
    payloadHash;

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope =
    `${dateStamp}/${region}/${service}/aws4_request`;

  const stringToSign =
    algorithm +
    "\n" +
    amzDate +
    "\n" +
    credentialScope +
    "\n" +
    hash(canonicalRequest);

  const kDate = hmac("AWS4" + process.env.AMAZON_SECRET_KEY, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");

  const signature = crypto
    .createHmac("sha256", kSigning)
    .update(stringToSign)
    .digest("hex");

  const authorization =
    `${algorithm} Credential=${process.env.AMAZON_ACCESS_KEY}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Encoding": "amz-1.0",
    "X-Amz-Date": amzDate,
    "Authorization": authorization,
    "Host": host
  };
}
