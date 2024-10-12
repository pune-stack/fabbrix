import { Button } from "@windmill/react-ui";
import { useCart } from "context/CartContext";
import { useUser } from "context/UserContext";
import toast from "react-hot-toast";
import { usePaystackPayment } from "react-paystack";
import { useNavigate } from "react-router-dom";
import orderService from "services/order.service";

console.log('payment 1')
const PaystackBtn = ({ isProcessing, setIsProcessing }) => {
  const { cartSubtotal, cartTotal, cartData, setCartData } = useCart();
  const { userData } = useUser();
  const navigate = useNavigate();

  console.log('payment 2')
  const onSuccess = (data) => {
    orderService.createOrder(cartSubtotal, cartTotal, data.reference, "GPay").then(() => {
      setCartData({ ...cartData, items: [] });
      setIsProcessing(true);
      navigate("/cart/success", {
        state: {
          fromPaymentPage: true,
        },
      });
    });
  };

  const onClose = () => {
    toast.error("Payment cancelled");
    setIsProcessing(false);
  };

  console.log('payment 3')
  const config = {
    email: userData.email,
    amount: (cartSubtotal * 100).toFixed(2),
    publicKey: import.meta.env.VITE_PAYSTACK_PUB_KEY,
  };

  console.log('payment 4')
  const initializePayment = usePaystackPayment(config);
  return (
    <Button
      disabled={isProcessing}
      className="w-full"
      onClick={() => {
        setIsProcessing(true);
        console.log('payment 5')
        // initializePayment(onSuccess, onClose);
        console.log('payment 6')
      }}
    >
      {isProcessing ? "Processing..." : "Pay Here"}
    </Button> 

      );
      
};

export default PaystackBtn;