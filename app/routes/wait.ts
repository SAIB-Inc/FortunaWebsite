import { ActionFunctionArgs } from "@remix-run/node";
import { CborHex, Transaction } from "@saibdev/bifrost";
import { finalizeTx, waitForTransaction } from "~/tunaTx";
import { FinalizeResponse } from "~/types";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const address_hex = formData.get("addressHex") as string;
    const tx_id = formData.get("txId") as string;
    await waitForTransaction(address_hex, tx_id);
    return tx_id;
}
