import { PaymentConfirmation } from "../../../components/PaymentConfirmation";

export default function ConfirmPaymentPage({ searchParams }: { searchParams: { token: string, userId: string, amount: string } }) {
    const { token, userId, amount } = searchParams;

    return (
        <PaymentConfirmation token={token} userId={parseInt(userId)} amount={parseInt(amount)} />
    );
}