import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from amazon.paapi import AmazonApi

app = FastAPI()

amazon = AmazonApi(
    access_key=os.environ["AKPA9VNVRH1767955301"],
    secret_key=os.environ["8znSftswyoWvOPD8FBjGXGW0ST31OJCojvxMkjG2"],
    associate_tag=os.environ["database21-21"],
    country=os.environ.get("AMAZON_COUNTRY", "IN")
)

@app.get("/api/product")
def get_product(asin: str):
    try:
        result = amazon.get_items([asin])
        item = result.items[0]

        return {
            "asin": asin,
            "title": item.item_info.title.display_value,
            "price": item.offers.listings[0].price.display_amount if item.offers else "N/A",
            "image": item.images.primary.large.url if item.images else "",
            "affiliate_link": item.detail_page_url
        }

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
