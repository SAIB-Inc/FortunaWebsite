import { ActionFunction, json } from "@remix-run/node";
import { buildConvertTunaTx } from "~/tunaTx";

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const amount = formData.get("amount") as string;
    const addressHex = formData.get("addressHex") as string;
    console.log("Amount: ", amount);
    try {
      const builtTx = await buildConvertTunaTx(addressHex, BigInt(amount));
      return json({ success: true, transaction: builtTx });
    } catch (error: any) {
      return json({ success: false, error: error.message }, { status: 500 });
    }
  };