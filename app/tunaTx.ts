import { Blaze, Blockfrost, ColdWallet, Core, Data, makeValue } from "@blaze-cardano/sdk";
import { AssetId, HexBlob, NetworkId, TransactionId, TransactionInput, TxCBOR, VkeyWitness } from "@blaze-cardano/core";
import { buildLockDatumPlutusData, buildUnlockRedeemerPlutusData, buildWithdrawRedeemerPlutusData, FORK_REWARD_ACCOUNT, FORK_SCRIPT_REF, FORK_VALIDATOR_ADDRESS, LOCK_STATE_ASSET_ID, LockDatum, MINT_SCRIPT_REF, TUNA_V1_ASSET_ID, TUNA_V2_ASSET_ID, TUNA_V2_MINT_REDEEMER, ConvertResponse, TunaBalance } from "./types";
import { CborHex, Transaction, Value } from "@saibdev/bifrost";

export async function buildConvertTunaTx(addressHex: string, amount: bigint) {

    const provider = new Blockfrost(
        {
            network: "cardano-mainnet",
            projectId: "mainnetuRUrQ38l0TbUCUbjDDRNfi8ng1qxCtpT",
        }
    )

    const wallet = new ColdWallet(
        Core.Address.fromBytes(Core.HexBlob.fromBytes(Buffer.from(addressHex, 'hex'))),
        NetworkId.Mainnet,
        provider,
    );

    const blaze = await Blaze.from(provider, wallet);

    const refInputs = await blaze.provider.resolveUnspentOutputs([
        FORK_SCRIPT_REF,
        MINT_SCRIPT_REF,
    ]);
    const lockUtxo = await blaze.provider.getUnspentOutputByNFT(LOCK_STATE_ASSET_ID);
    const lockedDatum: LockDatum = Data.from(lockUtxo.output().datum()?.asInlineData()!, LockDatum);

    const newLockedTunaV1Amount = lockedDatum.currentLockedTuna + amount;
    lockedDatum.currentLockedTuna = newLockedTunaV1Amount;
    const withdrawRedeemer = buildWithdrawRedeemerPlutusData(amount);


    const newLockedDatum = buildLockDatumPlutusData(lockedDatum);
    const txRaw = await blaze
        .newTransaction()
        .addReferenceInput(refInputs[0])
        .addReferenceInput(refInputs[1])
        .addInput(lockUtxo, buildUnlockRedeemerPlutusData())
        .lockAssets(
            FORK_VALIDATOR_ADDRESS,
            makeValue(0n, [LOCK_STATE_ASSET_ID, 1n], [TUNA_V1_ASSET_ID, newLockedTunaV1Amount]),
            newLockedDatum,
        )
        .addMint(
            AssetId.getPolicyId(TUNA_V2_ASSET_ID),
            new Map([[AssetId.getAssetName(TUNA_V2_ASSET_ID), amount]]),
            TUNA_V2_MINT_REDEEMER,
        )
        .addWithdrawal(FORK_REWARD_ACCOUNT, 0n, withdrawRedeemer)
        .complete();

    return txRaw.toCbor();
}

export function finalizeTx(unsignedTxCbor: CborHex<Transaction>, txWitnessCbor: string) {
    const vkeyWitnessSet = Core.TransactionWitnessSet.fromCbor(HexBlob.fromBytes(Buffer.from(txWitnessCbor, 'hex')))
    const tx = Core.Transaction.fromCbor(unsignedTxCbor as string as TxCBOR)
    const redeemers = tx.witnessSet().redeemers();
    vkeyWitnessSet.setRedeemers(redeemers!);
    tx.setWitnessSet(vkeyWitnessSet);
    return tx.toCbor();

}

export function getBalance(balanceCbor: CborHex<Value>) {
    const balance = Core.Value.fromCbor(HexBlob.fromBytes(Buffer.from(balanceCbor, 'hex')))
    let v1Balance = 0n;
    let v2Balance = 0n;

    balance.multiasset()?.forEach((value, key) => {
        if (key === TUNA_V1_ASSET_ID) {
            v1Balance = value;
        } else if (key === TUNA_V2_ASSET_ID) {
            v2Balance = value;
        }
    })

    const response: TunaBalance = {
        tuna_v1: Number(v1Balance),
        tuna_v2: Number(v2Balance),
    }
    return response;

}

export async function waitForTransaction(addressHex: string, txId: string) {
    const provider = new Blockfrost(
        {
            network: "cardano-mainnet",
            projectId: "mainnetuRUrQ38l0TbUCUbjDDRNfi8ng1qxCtpT",
        }
    )
    const wallet = new ColdWallet(
        Core.Address.fromBytes(Core.HexBlob.fromBytes(Buffer.from(addressHex, 'hex'))),
        NetworkId.Mainnet,
        provider,
    );
    const transaction_id = TransactionId(txId);
    const blaze = await Blaze.from(provider, wallet);
    while (true) {
        try {
            delay(1000);
            await blaze.provider.resolveUnspentOutputs([new TransactionInput(transaction_id, 0n)]);
            break;
        } catch (error) {
        }
    }
}

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


