const environment = process.env.CONTEXT;
const apiKey = environment !== "production" ? process.env.STRIPE_TEST_KEY : "ADD PRODUCTION KEY";

let msg = ""
if (environment !== "production") {
    msg = "no production"
}
else {
    msg = "is production"
}
exports.handler = async function (event, context) {
    const stripe = require("stripe")(apiKey);
    const referer = event.headers.referer;
    const sentCart = JSON.parse(event.body)
    const stripeLineItems = []

    for (const item in sentCart) {
        stripeLineItems.push({ price: sentCart[item].priceId, quantity: sentCart[item].quantity })

    }
    const session = await stripe.checkout.sessions.create({
        line_items: stripeLineItems,
        mode: "payment",
        success_url: "https://phoenixofalexandria.netlify.app/",
        cancel_url: referer
    })
    console.log(session.url)
    return {
        statusCode: 200,
        body: JSON.stringify({ msg: msg, stripeUrl: session.url }),
        headers: {
            Location: session.url
        }
    }
}