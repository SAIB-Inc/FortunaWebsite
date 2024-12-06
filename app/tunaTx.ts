import { Blaze, ColdWallet, Core, Data, Kupmios, makeValue } from "@blaze-cardano/sdk";
import { Unwrapped } from "@blaze-cardano/ogmios";
import { AssetId, NetworkId } from "@blaze-cardano/core";
import { buildLockDatumPlutusData, buildUnlockRedeemerPlutusData, buildWithdrawRedeemerPlutusData, FORK_REWARD_ACCOUNT, FORK_SCRIPT_REF, FORK_VALIDATOR_ADDRESS, LOCK_STATE_ASSET_ID, LockDatum, MINT_SCRIPT_REF, TUNA_V1_ASSET_ID, TUNA_V2_ASSET_ID, TUNA_V2_MINT_REDEEMER } from "./types";

export async function buildConvertTunaTx(addressHex: string, amount: bigint) {

    const provider = new Kupmios(
        "https://kupo1shqzdry3gh2dsgdy3lg.mainnet-v2.kupo-m1.demeter.run",
        await Unwrapped.Ogmios.new("https://ogmios199hxc0fnr4wpjg8cp37.mainnet-v6.ogmios-m1.demeter.run")
    );

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
        .addWithdrawal(FORK_REWARD_ACCOUNT, 0n, buildWithdrawRedeemerPlutusData(0n))
        .complete();

}