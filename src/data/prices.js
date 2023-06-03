const environment = process.env.CONTEXT
const api_key = environment !== "production" 
? process.env.STRIPE_TEST_KEY 
: process.env.STRIPE_SECRET_KEY;