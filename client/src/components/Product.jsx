import { Button, CardBody } from "@windmill/react-ui";
import { useCart } from "context/CartContext";
import { useState, useEffect } from "react";
import { ShoppingCart } from "react-feather";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { formatCurrency } from "../helpers/formatCurrency";

const Product = ({ product }) => {
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false); // State to track if added to cart
  const [timeLeft, setTimeLeft] = useState(0); // State for countdown timer
  const [isTimerActive, setIsTimerActive] = useState(false); // State to manage timer activation

  // Effect to check local storage for timer on mount
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("discountTimer"));
    if (storedData) {
      const { addedAt, duration } = storedData;
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - addedAt;

      // Calculate the remaining time
      const remainingTime = duration - elapsed;
      if (remainingTime > 0) {
        setTimeLeft(remainingTime);
        setIsAddedToCart(true);
        setIsTimerActive(true);
      } else {
        localStorage.removeItem("discountTimer"); // Clear expired timer
      }
    }
  }, []);

  const addToCart = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addItem(product, 1);
      setIsAddedToCart(true); // Set to true when item is added
      toast.success("Added to cart");
      startTimer(); // Start the timer when an item is added to the cart
    } catch (error) {
      console.log(error);
      toast.error("Error adding to cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to start the timer
  const startTimer = () => {
    const duration = 1800; // Set your timer duration in seconds
    setTimeLeft(duration);
    setIsTimerActive(true);

    // Save timer data to local storage
    const dataToStore = {
      duration, // Store the total duration
      addedAt: Math.floor(Date.now() / 1000), // Current time in seconds
    };
    localStorage.setItem("discountTimer", JSON.stringify(dataToStore));
  };

  // Effect to handle countdown
  useEffect(() => {
    let timer;

    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;

          // Update the stored time remaining in local storage
          const updatedData = {
            duration: newTime,
            addedAt: Math.floor(Date.now() / 1000) - (newTime), // Update addedAt based on remaining time
          };
          localStorage.setItem("discountTimer", JSON.stringify(updatedData));
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false); // Stop the timer when it reaches zero
      setIsAddedToCart(false); // Reset the added state to remove discount indication
      localStorage.removeItem("discountTimer"); // Clear expired timer
    }

    // Clean up interval on unmount or when the timer is inactive
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  // Function to format the time left in mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Link to={`/products/${product.slug}`}>
      <div className="group">
        <span className="block relative h-48 rounded overflow-hidden">
          <img
            className="w-full h-full object-contain object-center"
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            title={product.name}
          />
        </span>
        <CardBody className="flex flex-col items-stretch mt-4">
          <h2 className="title-font text-lg font-medium overflow-ellipsis whitespace-nowrap overflow-hidden">
            {product.name}
          </h2>
          {/* Original price with strikethrough */}
          {isAddedToCart ? (
            <p className="line-through text-gray-500">{formatCurrency(product.price)}</p>
          ) : (
            <p className="">{formatCurrency(product.price)}</p>
          )}
          
          {/* Show discount price only if added to cart */}
          {isAddedToCart && (
            <p className="text-red-600">
              Get at {formatCurrency(product.discount_price)} with discount!
            </p>
          )}
          
          <Button
            iconLeft={() =>
              isLoading ? (
                <ClipLoader
                  cssOverride={{
                    margin: "0 auto",
                  }}
                  color="#123abc"
                  size={20}
                />
              ) : (
                <ShoppingCart className="mr-2" />
              )
            }
            className="mt-4 transition duration-200 ease-out lg:bg-opacity-0 group-hover:bg-opacity-100"
            onClick={(e) => addToCart(e)}
          >
            {isLoading ? null : "Add to Cart"}
          </Button>
          
          {/* Show timer only if active */}
          {isTimerActive && timeLeft > 0 && (
            <p className="mt-4 text-red-600">
              Discount available for: {formatTime(timeLeft)}
            </p>
          )}
        </CardBody>
      </div>
    </Link>
  );
};

export default Product;
