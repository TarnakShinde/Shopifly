import { NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import OrderConfirmation from "@/emails/OrderConfirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    try {
        const { email, orderId, items, total } = await req.json();

        const emailHtml = render(OrderConfirmation({ orderId, items, total }));

        const data = await resend.emails.send({
            from: "shindetarnak@gmail.com",
            to: email,
            subject: "Order Confirmation - ShopiFly",
            html: emailHtml,
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error });
    }
}
