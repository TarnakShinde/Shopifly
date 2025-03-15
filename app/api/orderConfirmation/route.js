import { NextResponse } from "next/server";
import FormData from "form-data";
import Mailgun from "mailgun.js";

export async function POST(req) {
    try {
        const { to, subject, text } = await req.json();

        if (!to || !subject || !text) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const mailgun = new Mailgun(FormData);
        const mg = mailgun.client({
            username: "api",
            key: process.env.MAILGUN_API_KEY, // Use environment variable for security
        });

        const domain = "sandbox4ade01b2684d4085892f4783fac57d1d.mailgun.org";

        const data = await mg.messages.create(domain, {
            from: `Mailgun Sandbox <postmaster@${domain}>`,
            to: [to],
            subject,
            text,
        });

        return NextResponse.json({ message: "Email sent successfully", data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
