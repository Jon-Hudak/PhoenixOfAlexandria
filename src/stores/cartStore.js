import { atom } from 'nanostores';
import { persistentMap } from '@nanostores/persistent'

export const isCartOpen = atom(false);
export const checkStore = atom(false);
export const cartTotal = atom(0);
export const cartQty = atom(0);
export const productStore = atom([]);
export const cart = persistentMap('cart', {}, {
    encode: JSON.stringify,
    decode: JSON.parse,
})
updateCartTotal();

export function addCartItem(id, format = "digital") {
    const cartItem = id + format;
    const existingEntry = cart.get()[cartItem];
    if (existingEntry) {
        cart.setKey(cartItem, { ...existingEntry, quantity: existingEntry.quantity + 1 || 1 })
    }
    else {
        const { name, imgSrc, url, price, priceId } = findProduct(id, format);

        cart.setKey(cartItem, { id, name, price, format, imgSrc, url, priceId, quantity: 1 })

    }

    updateCartTotal()

}

export function removeCartItem(item) {
    const cartItem = item.id + item.format;
    const existingEntry = cart.get()[cartItem];
    if (existingEntry) {
        cart.setKey(cartItem, undefined)
    }
    else {
        console.error("This item doesn't exist in cart");
    }
    updateCartTotal()
}
export function updateCartQty(item, qty = 1) {
    const cartItem = item.id + item.format;
    const existingEntry = cart.get()[cartItem];
   

    if (existingEntry) {
        cart.setKey(cartItem, { ...existingEntry, quantity: qty })
    }
    else {
        console.error("This item doesn't exist in cart");
    }
    updateCartTotal()
}


function findProduct(id, format) {
    const product = productStore.get().find((product) => product.frontmatter.id == id);
    
    return { name: product.frontmatter.product, price: product.frontmatter.prices[format], imgSrc: product.frontmatter.imgs ? product.frontmatter.imgs[0] : "", url: product.url, priceId: product.frontmatter.priceId[format] };

}

function updateCartTotal() {
    let total = 0;
    let quantity = 0;
    let cartObj = cart.get()
    let USD = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });


    for (const item in cartObj) {
        
        total += ((cartObj[item].price * 100) * (cartObj[item].quantity)) / 100;
        quantity += parseInt(cartObj[item].quantity);
        
    }
    total = USD.format(total);

    cartTotal.set(total);
    cartQty.set(quantity);

    function updateNumberOfItems() {


    }
}