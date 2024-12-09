import { ActionFunctionArgs, json } from "@remix-run/node";
import { CborHex, Transaction } from "@saibdev/bifrost";
import { finalizeTx } from "~/tunaTx";
import { FinalizeResponse } from "~/types";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const unsigned_tx_cbor = formData.get("unsignedTxCbor") as string;
    const tx_witness_cbor = formData.get("txWitnessCbor") as string;
    const tx = finalizeTx(unsigned_tx_cbor as CborHex<Transaction>, tx_witness_cbor);
    const finalResponse: FinalizeResponse = {
        type: "finalize",
        success: true,
        tx_cbor: tx,
    }
    return finalResponse;
}
