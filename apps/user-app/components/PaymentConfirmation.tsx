"use client";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";

interface PaymentConfirmationProps {
    token: string;
    userId: number;
    amount: number;
}

export const PaymentConfirmation = ({ token, userId, amount }: PaymentConfirmationProps) => {
    const router = useRouter();

    const handleProceed = async () => {
        try {
            // Send a request to the webhook to mark the transaction as "Success"
            const response = await fetch("http://localhost:3003/hdfcWebhook", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    user_identifier: userId.toString(),
                    amount: amount.toString(),
                }),
            });

            if (response.ok) {
                alert("Payment Succeeded!");
                router.push("/transfer");
            } else {
                const data = await response.json();
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error hitting webhook:", error);
            alert("Failed to process payment. Please try again.");
        }
    };

    const handleCancel = async () => {
        try {
            // Send a request to the webhook to mark the transaction as "Failed"
            const response = await fetch("http://localhost:3003/hdfcWebhook", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    user_identifier: userId.toString(),
                    amount: amount.toString(),
                    status: "Failure"
                }),
            });

            if (response.ok) {
                alert("Payment Cancelled!");
                router.push("/transfer");
            } else {
                const data = await response.json();
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error hitting webhook:", error);
            alert("Failed to cancel payment. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center w-full mt-40">
            <h2 className="text-lg font-bold">Confirm Payment</h2>
            <div className="mt-4">
                <Button onClick={handleProceed}>Proceed</Button>
                <Button onClick={handleCancel}>Cancel</Button>
            </div>
        </div>
    );
};
