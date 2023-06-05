const environment = process.env.CONTEXT;
const webhookSecretKey = process.env.STRIPE_WEBHOOK_SECRET
const stripeKey = environment !== "production" ? process.env.STRIPE_TEST_KEY : "ADD PRODUCTION KEY";

const stripe = require("stripe")(stripeKey);

// const AWS = require("aws-sdk");
// const S3Bucket = "PoADownloads";

// //Sendgrid
// const templateId="ID GOES HERE";
// const sgMail = require("@sendgrid/mail");
// const fromEmail = "POA EMAIL HERE";

// function getSignedUrl(filename) {
//     AWS.config = new AWS.Config({
//         accessKeyId: process.env.MY_AWS_ACCESS_KEY,
//         secretAccessKey: process.env.MYAWS_SECRET_KEY,
//         region: "us-east-1",
//         signatureVersion: "v4",
//     });

//     const s3 = new AWS.S3();

//     //60 seconds for dev 1 week for production
//     const expirationTime = environment !== "production" ? 60 : 604800

//     return s3.getSignedUrl("getObject",{
//         Key: filename,
//         Bucket: S3Bucket,
//         Expires: expirationTime,
//     })
// }


export async function handler(event, context) {
    const { body, headers } = event;

    //check event came from Stripe
    try {
        const stripeEvent = stripe.webhooks.constructEvent(
            body,
            headers["stripe-signature"],
            webhookSecretKey,
        );
        console.log("****" + stripeEvent.type);
        if (stripeEvent.type === "checkout.session.completed") {
            const eventObject = stripeEvent.data.object;

            const items = await stripe.checkout.sessions.listLineItems(
                eventObject.id,
                { expand: ["data.price.product"] }
            );
            //TODO Loop over this
            const product = items.data[0]["price"]["product"]
            // const filename= product.metadata.filename;
            const itemName = product.name;

            //fulfillment
            const signedUrl = getSignedUrl(filename);

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);

            const msg={
                to: eventObject.customer_details.email,
                from: fromEmail, //verified sender
                templateId,
                dynamic_template_data:{
                    itemName,filename,url:signedUrl,
                },
            };
            await sgMail.send(msg);
            console.log("Email sent!");
        }

    }
    catch (err) {
        console.error(`Stripe webhook failed with ${err}`)
        return {
            statusCode: 400,
            body: `Webhook error: ${err}`,
        }
    }
    return {
        statusCode: 200,
    }


}