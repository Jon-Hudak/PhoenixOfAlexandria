const apiKey = process.env.STRIPE_TEST_KEY;
const stripe = require("stripe")(apiKey);

exports.handler = async function (event, context) {
    const referer = event.headers.referer;
    const sentCart = JSON.parse(event.body)
    const stripeLineItems = []
    // console.log(sentCart);
    for (const item in sentCart) {
        stripeLineItems.push({ price: sentCart[item].priceId, quantity: sentCart[item].quantity })
        // console.log(stripeLineItems);
    }
    const session = await stripe.checkout.sessions.create({
        line_items: stripeLineItems,
        mode: "payment",
        success_url: "https://www.google.com",
        cancel_url: referer
    })
    console.log(session.url)
    return {
        statusCode: 200,
        body: JSON.stringify({ msg: "hello world", stripeUrl: session.url }),
        headers: {
            Location: session.url
        }
    }
}