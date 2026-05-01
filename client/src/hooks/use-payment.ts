import { fetchFromApi } from "../helpers/api";

/**
 * Custom hook to handle Razorpay payment process.
 * 
 * Provides a handlePayment function that:
 * 1. Creates a checkout session (Razorpay Order)
 * 2. Opens the Razorpay checkout modal
 * 3. Verifies the payment on the server
 */
export const usePayment = () => {
  const handlePayment = async (teamSecret: string, onSuccess: (data: any) => void) => {
    try {
      // 1. Create a checkout session on the server
      const data = await fetchFromApi("/api/payments/checkout", {
        method: "POST",
        body: JSON.stringify({ teamSecret }),
      });

      // 2. Configure Razorpay options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Iotricity Registry",
        description: "Team Registration Fee",
        order_id: data.orderId,
        // The handler function is called after successful payment
        handler: async (response: any) => {
          try {
            // 3. Verify the payment on the server
            const verificationData = await fetchFromApi("/api/payments/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            
            if (onSuccess) {
              onSuccess(verificationData);
            }
          } catch (err: any) {
            console.error("Payment verification failed:", err);
            alert("Payment verification failed: " + err.message);
          }
        },
        prefill: {
          // These can be populated if session data is passed to the hook
        },
        theme: {
          color: "#9505F7", // Matching the project's purple theme
        },
        // Razorpay config for UPI-only payment
        config: data.config,
        modal: {
          ondismiss: function() {
            console.log("Checkout modal closed by user");
          }
        }
      };

      // 4. Open Razorpay checkout
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      
    } catch (err: any) {
      console.error("Error initiating payment:", err);
      alert("Error initiating payment: " + err.message);
    }
  };

  return { handlePayment };
};
