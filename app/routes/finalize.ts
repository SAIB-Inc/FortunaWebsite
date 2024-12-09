import { ActionFunctionArgs, json } from "@remix-run/node";
import { FinalizeResponse } from "~/types";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const unsigned_tx_cbor = formData.get("unsignedTxCbor") as string;
    const tx_witness_cbor = formData.get("txWitnessCbor") as string;
    
    const response = await fetch("https://8080-truthful-birthday-xc2vhr.us1.demeter.run/api/v1/transaction/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        unsignedTxCbor: unsigned_tx_cbor,
        txWitnessCbor: tx_witness_cbor,
       }),
    })

    const data = await response.text();
    const finalResponse: FinalizeResponse = {
      type: "finalize",
      success: true,
      signed_tx_cbor: data,
     }

     return finalResponse;
}
