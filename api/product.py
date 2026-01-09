from fastapi import FastAPI
from amazon.paapi import AmazonApi
from fastapi.responses import JSONResponse

app = FastAPI()

amazon = AmazonApi(
    access_key="AKPAN6ZFJP1766147276",
    secret_key="QktcnaJJXgBs4SH0siw96O5anez4qdWr4W0cpIOM",
    associate_tag="database21-21",
    country="IN"
)

@app.get("/api/product")
def get_product(asin: str):

    try:
        items = amazon.get_items([asin])
        item = items.items[0]

        return JSONResponse({
            "asin": asin,
            "title": item.item_info.title.display_value,
            "price": item.offers.listings[0].price.display_amount if item.offers else "N/A",
            "image": item.images.primary.large.url if item.images else "",
            "affiliate_link": item.detail_page_url
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

