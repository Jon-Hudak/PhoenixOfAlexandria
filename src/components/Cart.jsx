import { useEffect, useState } from 'preact/hooks'
import { cart, productStore, removeCartItem, isCartOpen, updateCartQty, cartTotal } from "../stores/cartStore";
import { useStore } from '@nanostores/preact';

function Cart({ products }) {

  const $cart = useStore(cart);
  const $isCartOpen = useStore(isCartOpen);
  const $cartTotal = useStore(cartTotal);

  useEffect(() => {
    productStore.set(products);
  }, []);

  useEffect(() => {
    if ($isCartOpen) {
      document.body.style.overflow = "hidden";
    }
    else {
      document.body.style.overflow = "auto"
    }

    return () => {

    }
  }, [$isCartOpen])


  function cartNumberChanged(e, item) {

    updateCartQty(item, e.target.value)

  }
  function handleKeyDown(e) {
    console.log(e);
    if (e.key === "Escape") {
      isCartOpen.set(false)
    }
  }
  function stopProp(e) {
    e.stopPropagation();
  }
  function toggleCart(e) {
    isCartOpen.set(!isCartOpen.get())
  }

  async function handleCartSubmit(e) {
    const response = await fetch("/.netlify/functions/createCheckoutSession", {
      method: 'POST',

      body: JSON.stringify($cart),
      redirect: 'follow',
    }).then(res => res.json())
      .then((data) => document.location = data.stripeUrl)
      .catch(err => console.log("error", err.json));
  }

  return (
    <> {$isCartOpen && <div tabIndex={-1} onKeyDown={handleKeyDown} onClick={toggleCart} class="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm">
      <section onClick={stopProp} class="bg-white ml-auto h-full z-40 flex flex-col  border border-neutral-800 rounded-b-md lg:w-1/2 xl:w-2/5 max-w-[30rem] pointer-events-auto animate-move-left translate-x-full ">
        <button onClick={toggleCart} class="closeModal absolute top-3 right-5 font-bold">X</button><h2 class="h2 py-5 border-b border-neutral-400">Cart</h2>
        <div class='overflow-y-scroll'>

          {Object.keys($cart).length== 0 && <div class='py-16 text-center font-semibold '>

            Nothing in cart, yet! 
          </div>

          }

          {Object.values($cart).map((item, i) => //$cart.get from cartStore, looping over the object values
            <article class='flex gap-4 place-items-center bg-neutral-200 py-5 px-5  border-b border-neutral-400' key={i}>
              <a class="grid grid-cols-2 place-items-center justify-between w-full gap-5 h-full" href={item.url}>
                <img class="rounded-sm w-24 shrink-0" src={item.imgSrc} width={64} />
                <div class="flex flex-col place-items-start w-full h-full my-auto md:mb-0 gap-2 justify-between">
                  <span class="flex flex-col w-full">
                    <strong class='font-serif font-semibold text-lg mr-auto w-full'>{item.name}</strong>
                    <em class="mr-auto">{item.format.charAt(0).toUpperCase() + item.format.slice(1)}</em></span>
                  <span>${item.price}</span>
                </div>
              </a>
              <div class="h-full  gap-3 md:gap-5 flex flex-col md:flex-row justify-between">
                <label class='flex md:place-items-center gap-3 font-semibold' >Qty:
                  {/* if the item is digital then quantity cannot be changed and maximum is 10. If not then maximum is 10. */}
                  <input onChange={(e) => cartNumberChanged(e, item)} type="number" disabled={item.format === "digital"} max={item.format === "digital" ? 1 : 10} min="1" class="w-12 pl-2 py-2 rounded-sm border border-neutral-400" value={item.quantity} />
                </label>


                <button data-id={item.id} onClick={(e) => removeCartItem(item)} class="bg-red-500 text-semibold h-10 px-4 py-2 rounded-full ">
                  Remove
                </button>
              </div>
            </article>
          )}</div>
        <div class="py-5 mt-aut flex place-items-center bg-neutral-00 border-t border-neutral-600 h-max">


          <button onClick={handleCartSubmit} class="button-md mx-4 py-5 w-full">Checkout</button>



          <p class="text-right text-lg pr-6 font-bold inline-block whitespace-nowrap">Total: {$cartTotal}</p>


        </div>
      </section></div>}
    </>
  )
}

export default Cart