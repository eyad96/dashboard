import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

/**
 * Clerk webhook endpoint — handles user.created, user.updated, user.deleted
 * events to keep the Convex `users` table in sync.
 *
 * In Clerk Dashboard → Webhooks, set the endpoint URL to:
 *   https://kindhearted-panda-167.eu-west-1.convex.site/clerk-webhook
 *
 * Subscribe to at minimum: user.created, user.updated, user.deleted
 * Then copy the "Signing Secret" and set it as CLERK_WEBHOOK_SECRET in
 * your Convex environment variables (convex dashboard → Settings → Env Vars).
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    // ── 1. Verify the Svix signature ─────────────────────────────────────
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET env var is not set");
      return new Response("Internal Server Error", { status: 500 });
    }

    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing Svix headers", { status: 400 });
    }

    const payload = await req.bytes();
    const body = new TextDecoder().decode(payload);

    let evt: { type: string; data: Record<string, unknown> };
    try {
      const wh = new Webhook(webhookSecret);
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as typeof evt;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Webhook verification failed", { status: 400 });
    }

    // ── 2. Handle user events ─────────────────────────────────────────────
    const { type, data } = evt;

    if (type === "user.created" || type === "user.updated") {
      const primaryEmail =
        (
          data.email_addresses as Array<{
            id: string;
            email_address: string;
          }>
        ).find((e) => e.id === data.primary_email_address_id)?.email_address ??
        "";

      await ctx.runMutation(internal.users.upsertFromClerk, {
        clerkId: data.id as string,
        email: primaryEmail,
        firstName: (data.first_name as string | null) ?? undefined,
        lastName: (data.last_name as string | null) ?? undefined,
        imageUrl: (data.image_url as string | null) ?? undefined,
      });
    } else if (type === "user.deleted") {
      await ctx.runMutation(internal.users.deleteFromClerk, {
        clerkId: data.id as string,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
