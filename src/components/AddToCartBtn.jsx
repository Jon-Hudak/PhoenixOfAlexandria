import { useEffect, useState } from 'preact/hooks'
import { addCartItem, isCartOpen } from '../stores/cartStore'

function AddToCartBtn({ id, className, disabled }) {

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
        <button disabled={disabled} class={"button addCart disabled:bg-neutral-300 " +className } onClick={addToCart}>
            {disabled?"Item Coming Soon!":"Add to Cart"}
        </button>
    )
}

export default AddToCartBtn