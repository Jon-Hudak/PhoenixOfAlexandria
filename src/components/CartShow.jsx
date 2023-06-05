import { isCartOpen, cartQty } from "../stores/cartStore";
import { useStore } from '@nanostores/preact';

function CartShow({children}) {
  const $cartQty=useStore(cartQty);
  // 
  return (
    <button onClick={()=>{isCartOpen.set(!isCartOpen.get())}} class="flex place-content-end ml-auto md:ml-0 mr-4 sm:mr-8 relative">
      {$cartQty>0 && <span class="bg-orange-500 rounded-full h-6 w-6 absolute -top-2 -right-2">{$cartQty}</span>}
      {children}
      </button>
  )
}

export default CartShow