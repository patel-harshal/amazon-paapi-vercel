import fetch from "node-fetch";
import { sign } from "../lib/paapiSigner.js";
import { updateSheet } from "../lib/googleSheets.js";

export default async function handler(req, res) {
  const asins = req.body?.asins || [];

  if (asins.length === 0) {
    return res.status(400).json({ error: "No ASINs provided" });
  }

  const payload = {
    ItemIds: asins.slice(0, 10),
    Resources: [
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "Offers.Listings.SavingBasis",
      "CustomerReviews",
      "Images.Primary.Medium"
    ],
    PartnerTag: process.env.AMAZON_PARTNER_TAG,
    PartnerType: "Associates",
    Marketplace: "www.amazon.in"
  };

  const headers = sign(payload);

  const response = await fetch(
    "https://webservices.amazon.in/paapi5/getitems",
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    }
  );

  const data = await response.json();
  await updateSheet(data.ItemsResult.Items);

  res.json({ updated: asins.length });
}
