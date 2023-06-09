
import Stripe from "stripe"
const environment = process.env.CONTEXT;
const apiKey = process.env.STRIPE_TEST_KEY
//const apiKey = environment !== "production" ? process.env.STRIPE_TEST_KEY : "ADD PRODUCTION KEY";
const stripe = new Stripe(apiKey);
let msg = ""
if (environment !== "production") {
    msg = "no production"
}
else {
    msg = "is production"
}
exports.handler = async function (event, context) {

    const referer = event.headers.referer;
    const sentCart = JSON.parse(event.body)
    const stripeLineItems = []
    let needAddress = false;
    for (const item in sentCart) {
        //extras to add to the line item
        let lineItemAddons = { adjustable_quantity: { enabled: false } }

        if (sentCart[item].format !== "digital") {
            lineItemAddons.adjustable_quantity = { enabled: true, minimum: 1, maximum: 20 }
            needAddress = true
        }
        else if (sentCart[item].format === "digital") {
            sentCart[item].quantity = 1;
        }
        

        stripeLineItems.push({
            price: sentCart[item].priceId,
            quantity: sentCart[item].quantity,
            ...lineItemAddons,

        },
        )

    }
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: stripeLineItems,
            //if needAddress is true because a physical item exists in the cart, add US to allowed shipping addresses. Empty brackets disables address form in stripe.
            shipping_address_collection: { allowed_countries: needAddress ? ['US'] : [] },
            mode: "payment",
            success_url: "https://phoenixofalexandria.netlify.app/success",
            cancel_url: referer
        })



        return {
            statusCode: 200,
            body: JSON.stringify({ msg: msg, stripeUrl: session.url }),
            headers: {
                Location: session.url
            }
        }
    }
    catch (err) {
        console.error(err)
    }
}