import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../lib/auth-client";
import axios from "axios";
import { Loader2, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [pricing, setPricing] = useState<{ base: number; total: number } | null>(null);

  useEffect(() => {
    if (!isSessionPending && !session) {
      navigate("/");
      return;
    }

    if (session?.user?.email) {
      fetchUserTeam();
    }

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [session, isSessionPending]);

  const fetchUserTeam = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/teams/member/${session?.user?.email}`
      );
      setTeam(response.data);
      
      if (response.data.registrationStatus === 'PAID' || response.data.registrationStatus === 'VERIFIED') {
        setPaymentStatus('success');
      } else {
        // Pre-fetch pricing info
        const pricingResponse = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/payments/checkout`, {
          teamSecret: response.data.teamSecret,
        });
        setPricing({
          base: pricingResponse.data.baseAmount,
          total: pricingResponse.data.totalAmount,
        });
      }
    } catch (err: any) {
      setError("Failed to fetch team details.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentStatus('processing');
    setError(null);

    try {
      // 1. Create/Get order on server
      const { data: order } = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/payments/checkout`, {
        teamSecret: team.teamSecret,
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Iotricity Registry",
        description: `Registration fee for ${team.teamName}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // 3. Verify payment on server
            await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bypass: import.meta.env.DEV // Auto-bypass if verification fails in dev mode? No, better explicit.
            });
            setPaymentStatus('success');
          } catch (err) {
            setPaymentStatus('failed');
            setError("Payment verification failed. If you are in development, try the 'Simulate Success' button.");
          }
        },
        prefill: {
          name: session?.user?.name,
          email: session?.user?.email,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus('idle');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setPaymentStatus('failed');
      setError(err.response?.data?.message || "Failed to initiate payment.");
    }
  };

  if (isSessionPending || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Preparing checkout...</p>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="max-w-md mx-auto bg-card p-8 rounded-2xl shadow-lg border border-border text-center">
        <div className="bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-card-foreground mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground mb-8">
          Your registration fee has been paid successfully. Our team will verify your details soon.
        </p>
        <button
          onClick={() => navigate('/team')}
          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:opacity-90 transition-all"
        >
          Back to Team Page
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-card p-8 rounded-2xl shadow-lg border border-border">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-card-foreground">Complete Registration Payment</h2>
      </div>

      <div className="bg-background rounded-xl p-6 mb-8 border border-border">
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground">Team Name</span>
          <span className="font-bold text-foreground">{team?.teamName}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground">Members</span>
          <span className="font-bold text-foreground">{1 + (team?.teamMembers?.length || 0)}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground">Base Fee</span>
          <span className="font-bold text-foreground">₹ {pricing?.base}.00</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground text-xs italic">Incl. Razorpay Fees (2.36%)</span>
          <span className="font-bold text-foreground text-sm">₹ {(pricing?.total || 0) - (pricing?.base || 0)}</span>
        </div>
        <div className="border-t border-border pt-4 flex justify-between items-center">
          <span className="font-bold text-foreground">Total Amount</span>
          <span className="text-2xl font-black text-primary">₹ {pricing?.total}.00</span>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handlePayment}
          disabled={paymentStatus === 'processing'}
          className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {paymentStatus === 'processing' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Pay with Razorpay"
          )}
        </button>

        {import.meta.env.DEV && (
          <button
            onClick={async () => {
              setPaymentStatus('processing');
              try {
                // Mock an order first if one doesn't exist
                const { data: order } = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/payments/checkout`, {
                  teamSecret: team.teamSecret,
                });
                await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/payments/verify`, {
                  razorpay_order_id: order.id,
                  bypass: true
                });
                setPaymentStatus('success');
              } catch (err: any) {
                setError("Bypass failed: " + (err.response?.data?.message || err.message));
                setPaymentStatus('failed');
              }
            }}
            className="w-full bg-secondary text-secondary-foreground font-bold py-2 rounded-lg hover:opacity-90 transition-all text-xs"
          >
            [DEV] Simulate Payment Success
          </button>
        )}

        <p className="text-center text-[10px] text-muted-foreground uppercase font-black tracking-widest">
          Secure payment via Razorpay.
        </p>
      </div>
    </div>
  );
}
