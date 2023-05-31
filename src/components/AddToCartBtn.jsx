import { useEffect, useState } from 'preact/hooks'
import { addCartItem, isCartOpen } from '../stores/cartStore'

function AddToCartBtn({ id }) {

    function addToCart(e) {
        e.preventDefault();
        //If an input named "format" exists, format is equal to the one that's checked. Otherwise default to digital
        let format = document.querySelector("input[name='format']") ? 
            document.querySelector("input[name='format']:checked").id : "digital";

        isCartOpen.set(true);
        console.log(isCartOpen);
        addCartItem(id, format)
    }
    return (
        <button class="button addCart" onClick={addToCart}>
            Add to Cart
        </button>
    )
}

export default AddToCartBtn