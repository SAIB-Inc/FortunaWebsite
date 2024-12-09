import { ActionFunction, json } from "@remix-run/node";
import { buildConvertTunaTx } from "~/tunaTx";
import { ConvertResponse } from "~/types";

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const amount = formData.get("amount") as string;
    const addressHex = formData.get("addressHex") as string;

    const response: ConvertResponse = {
      type: "convert",
      success: false,
      tx_cbor: "",
    };
    try {
      const builtTx = await buildConvertTunaTx(addressHex, BigInt(amount));
      response.success = true;
      response.tx_cbor = builtTx;
      return response;
    } catch (error: any) {
      response.error = error.message;
      return response;
    }
  };