// const environment = process.env.CONTEXT
// const api_key = environment !== "production" 
// ? process.env.STRIPE_TEST_KEY 
// : process.env.STRIPE_SECRET_KEY;
// // const stripe=require("stripe")(api_key);
// //TODO Try/catch
// async function getPrices(){
//     const response = await stripe.prices.list({
//         expand:["data.product"],
//     })
//     return response.data.filter(price=>price.active)
// }
// module.exports = async function(){
//     return await getPrices();
// }