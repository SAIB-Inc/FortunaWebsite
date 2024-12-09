import { ActionFunction, json } from "@remix-run/node";
import { buildConvertTunaTx } from "~/tunaTx";
import { ConvertResponse } from "~/types";

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const amount = formData.get("amount") as string;
    const addressHex = formData.get("addressHex") as string;
    console.log("amount", amount);
    const response: ConvertResponse = {
      type: "convert",
      success: false,
      unsigned_tx_cbor: "",
    };
    try {
      const builtTx = await buildConvertTunaTx(addressHex, BigInt(amount));
      response.success = true;
      response.unsigned_tx_cbor = builtTx;
      return response;
    } catch (error: any) {
      return json({ success: false, error: error.message }, { status: 500 });
    }
  };