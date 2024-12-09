import { ActionFunctionArgs } from "@remix-run/node";
import { CborHex, Value } from "@saibdev/bifrost";
import { finalizeTx, getBalance } from "~/tunaTx";
import { FinalizeResponse } from "~/types";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const unsigned_tx_cbor = formData.get("balanceCbor");
    const balance = getBalance(unsigned_tx_cbor as CborHex<Value>);
    return balance;
}
