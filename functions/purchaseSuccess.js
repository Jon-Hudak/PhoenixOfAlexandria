import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import sgMail from "@sendgrid/mail"
import Stripe from "stripe"

const environment = process.env.CONTEXT;

const webhookSecretKey = environment !== "production" ? process.env.STRIPE_WEBHOOK_TEST : process.env.STRIPE_WEBHOOK_SECRET;

const stripeKey = environment !== "production" ? process.env.STRIPE_TEST_KEY : process.env.STRIPE_LIVE_KEY;


const stripe = new Stripe(stripeKey);


export async function handler(event, context) {
    // //Sendgrid
    const templateId = "d-63d78e7e8f9f455b8a449da96e0dda6c";
    const fromEmail = "phoenixofalexandriapgh@gmail.com";


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

        if (stripeEvent.type === "checkout.session.completed") {
            const eventObject = stripeEvent.data.object;

            const items = await stripe.checkout.sessions.listLineItems(
                eventObject.id,
                { expand: ["data.price.product"] }
            );


            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            let filename = false;
            let product = "";
            let itemName = "";
            let format = "";

            for (let i = 0; i < items.data.length; i++) {

                product = items.data[i].price;
                filename = product.product.metadata.filename
                itemName = product.product.name;
                format = product.nickname.replace(/^[a-z0-9]*[_]/i, "");

                if (format !== "digital" || format !== "paperback") { //if new formats are added to Stripe, add more here
                    throw new Error('Stripe price nickname needs to be in this format title_format , example: bookTitle_digital (format alone will also work)')
                }

                console.log(format);
                if (filename) {
                    //fulfillment
                    const signedUrl = await getSignedUrll(filename);

                    const msg = {
                        to: eventObject.customer_details.email,

                        from: fromEmail, //verified sender
                        templateId,
                        dynamic_template_data: {
                            itemName, filename, url: signedUrl, customerName: eventObject.customer_details.name,
                        },
                        hideWarnings: true
                    };
                    if (format === "digital") {
                        await sgMail.send(msg);
                    }
                }

            }

        }
        return {
            statusCode: 200, msg: "Email sent!",
        }
    }
    catch (err) {
        console.error(`Stripe webhook failed with ${err}`)
        return {
            statusCode: 400,
            body: `Webhook error: ${err}`,
        }
    }




    async function getSignedUrll(filename) {


        //60 seconds for dev 1 week for production
        const expirationTime = environment !== "production" ? 60 : 604800

        const command = new GetObjectCommand({
            Key: filename,
            Bucket: S3Bucket,
        });
        const url = await getSignedUrl(client, command, { expiresIn: expirationTime })
        return url;
        //    try{
        //     const response = await clientInformation. sent
        //    }

    }
}