import { google } from "googleapis";

export async function updateSheet(items) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(
      Buffer.from(
        process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
        "base64"
      ).toString()
    ),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const sheets = google.sheets({ version: "v4", auth });

  const values = items.map(item => [
    item.ASIN,
    item.ItemInfo?.Title?.DisplayValue || "",
    item.Offers?.Listings?.[0]?.Price?.Amount || "",
    item.Offers?.Listings?.[0]?.SavingBasis?.Amount || "",
    item.CustomerReviews?.StarRating || "",
    item.CustomerReviews?.Count || "",
    item.Images?.Primary?.Medium?.URL || "",
    item.DetailPageURL
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "A2:H",
    valueInputOption: "RAW",
    requestBody: { values }
  });
}
