import express from "express";
import db from "@repo/db/client";
const app = express();
import cors from "cors";

// Configure CORS to allow requests from your frontend domain
app.use(cors({
    origin: "http://localhost:3001", // Replace with your frontend's URL
    methods: ["POST", "OPTIONS"], // Allow both POST and OPTIONS requests
    allowedHeaders: ["Content-Type"],
}));

app.use(express.json())

app.post("/hdfcWebhook", async (req, res) => {
    //TODO: Add zod validation here?
    //TODO: HDFC bank should ideally send us a secret so we know this is sent by them
    //TODO: Check if this onRampTxn is processing or not
    const paymentInformation: {
        token: string;
        userId: string;
        amount: string
        status?: string;
    } = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount,
        status: req.body.status || "Success"
    };

    try {
        if (paymentInformation.status === "Failure") {
            await db.onRampTransaction.updateMany({
                where: {
                    token: paymentInformation.token
                },
                data: {
                    status: "Failure",
                }
            })
            res.json({
                message: "Failure"
            })
        }
        else {
            await db.$transaction([
                db.balance.updateMany({
                    where: {
                        userId: Number(paymentInformation.userId)
                    },
                    data: {
                        amount: {
                            // You can also get this from your DB
                            increment: Number(paymentInformation.amount)
                        }
                    }
                }),
                db.onRampTransaction.updateMany({
                    where: {
                        token: paymentInformation.token
                    },
                    data: {
                        status: "Success",
                    }
                })
            ]);

            res.json({
                message: "Captured"
            })
        }

    } catch (e) {
        console.error(e);
        res.status(411).json({
            message: "Error while processing webhook"
        })
    }

})

app.listen(3003);