import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import sgMail from "@sendgrid/mail"

const environment = process.env.CONTEXT;
const webhookSecretKey = process.env.STRIPE_WEBHOOK_SECRET


// const stripeKey = environment !== "production" ? process.env.STRIPE_TEST_KEY : "ADD PRODUCTION KEY";
const stripeKey = process.env.STRIPE_TEST_KEY;
//const sgMail = require("@sendgrid/mail");
const stripe = require("stripe")(stripeKey);


exports.handler = async function (event, context) {
    // //Sendgrid
    const templateId = process.env.SENDGRID_TEMPLATE_ID;

    const fromEmail = "duality656@hotmail.com"; //TODO CHANGE THIS
    const S3Bucket = "poadownloads";
    const client = new S3Client({
        region: "us-east-2", signatureVersion: 'v4',
        credentials: {
            accessKeyId: process.env.MY_AWS_ACCESS_KEY,
            secretAccessKey: process.env.MY_AWS_SECRET_KEY,



        }
    });






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
            const filename = product.metadata.filename;
            const itemName = product.name;
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            //fulfillment
            const signedUrl = await getSignedUrll(filename);
            console.log("*x*x*x*");




            const msg = {
                to: eventObject.customer_details.email,

                from: fromEmail, //verified sender
                templateId,
                dynamic_template_data: {
                    itemName, filename, url: signedUrl,
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



    async function getSignedUrll(filename = "hipster.pdf") {


        //60 seconds for dev 1 week for production
        const expirationTime = environment !== "production" ? 60 : 604800

        const command = new GetObjectCommand({
            Key: filename,
            Bucket: S3Bucket,
        });
        const url = await getSignedUrl(client, command, { expiresIn: expirationTime })
        console.log(url)
        return url;
        //    try{
        //     const response = await clientInformation. sent
        //    }

    }
}