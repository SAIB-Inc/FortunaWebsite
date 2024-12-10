import { AssetId, CredentialType, Hash28ByteBase16, NetworkId, RewardAccount, TransactionId, TransactionInput,  addressFromCredential } from "@blaze-cardano/core";
import { Constr, Core, Data, Static } from "@blaze-cardano/sdk";

export const V1_TUNA_POLICY_ID = '279f842c33eed9054b9e3c70cd6a3b32298259c24b78b895cb41d91a';
export const V2_TUNA_POLICY_ID = 'c981fc98e761e3bb44ae35e7d97ae6227f684bcb6f50a636753da48e';
export const HARD_FORK_HASH = '33443d66138f9609e86b714ff5ba350702ad7d4e476e4cba40cae696';
export const TUNA_ASSET_NAME = '54554e41';

export const LOCK_STATE_ASSET_ID = AssetId(HARD_FORK_HASH + "6c6f636b5f7374617465");
export const TUNA_V1_ASSET_ID = AssetId(V1_TUNA_POLICY_ID + TUNA_ASSET_NAME);
export const TUNA_V2_ASSET_ID = AssetId(V2_TUNA_POLICY_ID + TUNA_ASSET_NAME);

export const FORK_REWARD_ACCOUNT = RewardAccount.fromCredential(
    {
        type: CredentialType.ScriptHash,
        hash: Hash28ByteBase16(HARD_FORK_HASH),
    },
    NetworkId.Mainnet,
);

export const FORK_VALIDATOR_ADDRESS = addressFromCredential(NetworkId.Mainnet, Core.Credential.fromCore({
    type: CredentialType.ScriptHash,
    hash: Hash28ByteBase16(HARD_FORK_HASH),
}));

export const TUNA_V2_MINT_REDEEMER = Data.to(new Constr(2, []));

export const FORK_SCRIPT_REF = new TransactionInput(
    TransactionId(
        "55897091192254abbe6501bf4fd63f4d9346e9c2f5300cadfcbe2cda25fd6351",
    ),
    0n,
);

export const MINT_SCRIPT_REF = new TransactionInput(
    TransactionId(
        "80874829afb2cb34e23d282d763b419e26e9fb976fe8a7044eebbdf6531214b7",
    ),
    0n,
);

export const WithdrawRedeemerSchema = Data.Enum([
    Data.Object({ HardFork: Data.Object({ lockOutputIndex: Data.Integer() }) }),
    Data.Object({
        Lock: Data.Object({
            lockOutputIndex: Data.Integer(),
            lockingAmount: Data.Integer(),
        }),
    }),
]);

export type WithdrawRedeemer = Static<typeof WithdrawRedeemerSchema>;
export const WithdrawRedeemer = WithdrawRedeemerSchema as unknown as WithdrawRedeemer;

export function buildWithdrawRedeemerPlutusData(amount: bigint) {
    return Data.to({
        Lock: {
            lockOutputIndex: 0n,
            lockingAmount: amount,
        },
    }, WithdrawRedeemer);
}

const UnlockRedeemerSchema = Data.Enum([
    Data.Object({ Mint: Data.Object({ zero: Data.Integer() }) }),
    Data.Object({ Spend: Data.Object({ zero: Data.Integer() }) })
]);

type UnlockRedeemer = Static<typeof UnlockRedeemerSchema>;
const UnlockRedeemer = UnlockRedeemerSchema as unknown as UnlockRedeemer;

export function buildUnlockRedeemerPlutusData() {
    return Data.to({ Spend: { zero: 0n } }, UnlockRedeemer);
}

export const LockDatumSchema = Data.Object({
    blockHeight: Data.Integer(),
    currentLockedTuna: Data.Integer(),
});
export type LockDatum = Static<typeof LockDatumSchema>;
export const LockDatum = LockDatumSchema as unknown as LockDatum;

export function buildLockDatumPlutusData(lockDatum: LockDatum) {
    return Data.to(lockDatum, LockDatum);
}


export type BaseTxResponse = {
    success: boolean;
    tx_cbor: string;
    error?: string;
}

export type ConvertResponse = {type: "convert"} & BaseTxResponse;

export type FinalizeResponse = {type: "finalize"} & BaseTxResponse;

export type TunaBalance = {
    tuna_v1: number;
    tuna_v2: number;
}