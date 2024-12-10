import { type MetaFunction } from "@remix-run/node";
import { ConvertIcon } from "~/components/convert_icon";
import { FishIcon } from "~/components/fish_icon";
import { AddressHex, CardanoWallet, CardanoWalletApi, CborHex, getWallets, Transaction, Value } from "@saibdev/bifrost";
import { useCallback, useEffect, useState } from "react";
import { SelectWalletModal } from "~/components/select_wallet_modal";
import { useFetcher } from "@remix-run/react";
import { ConvertResponse, FinalizeResponse, TunaBalance } from "~/types";
import { SuccesModal } from "~/components/success_modal";
import { Confetti } from "~/components/confetti";


export const meta: MetaFunction = () => {
  return [
    { title: "Fortuna Converter" },
    { name: "description", content: "Convert your V1 $TUNA to V2 $TUNA" },
  ];
};

export default function Index() {
  const [wallets, setWallets] = useState<CardanoWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<CardanoWallet | null>(null);
  const [walletApi, setWalletApi] = useState<CardanoWalletApi>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amountInput, setAmountInput] = useState<string>('');
  const [addressHex, setAddressHex] = useState<AddressHex>();
  const [tunaBalance, setTunaBalance] = useState<TunaBalance>();
  const [isLoading, setIsloading] = useState(false);
  const fetcher = useFetcher<ConvertResponse | FinalizeResponse>();
  const dataFetcher = useFetcher();
  const waitFetcher = useFetcher();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWaitingConfirmation, setIsWaitingConfirmation] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleOpenModal = useCallback(() => {
    if (selectedWallet) {
      setSelectedWallet(null);
      localStorage.removeItem('selectedWalletId');
    } else {
      setIsModalOpen(true);
    }
  }, [selectedWallet]);

  const handleSelectWallet = useCallback(async (wallet: CardanoWallet | null) => {
    setIsModalOpen(false);
    try {
      const api = await wallet?.enable();
      setSelectedWallet(wallet);
      setWalletApi(api);
      localStorage.setItem('selectedWalletId', wallet!.id);

      const addressHex = await api?.getChangeAddress();
      setAddressHex(addressHex);
    } catch {
      setSelectedWallet(null);
      setWalletApi(undefined);
    }
  }, []);

  const handleConvert = useCallback(() => {
    setIsloading(true);
    if (selectedWallet === null || selectedWallet === undefined) {
      setIsModalOpen(true);
      setIsloading(false);
      return;
    }
    if (tunaBalance?.tuna_v1 === 0) {
      setStatusMessage("You don't have any V1 $TUNA to convert");
      setIsloading(false);
      return;
    }
    const decimals = 8;
    const factor = Math.pow(10, decimals);

    if (!amountInput) {
      setStatusMessage("Please enter an amount to convert");
      setIsloading(false);
      return;
    };

    const amountFloat = parseFloat(amountInput);
    if (isNaN(amountFloat)) {
      setStatusMessage("Please enter a valid amount to convert");
      setIsloading(false);
      return;
    };

    const amountInteger = Math.round(amountFloat * factor);

    if (amountInteger == 0) {
      setStatusMessage("Please enter an amount greater than 0");
      setIsloading(false);
      return;
    };

    const formData = new FormData();
    formData.append("amount", amountInteger.toString());
    formData.append("addressHex", addressHex!);
    fetcher.submit(formData, { method: "post", action: "/convert" });

  }, [addressHex, amountInput, selectedWallet]);

  const handleFinalize = useCallback((unsignedTxCbor: string, txWitnessCbor: string) => {
    const formData = new FormData();
    formData.append("unsignedTxCbor", unsignedTxCbor);
    formData.append("txWitnessCbor", txWitnessCbor);

    fetcher.submit(formData, { method: "post", action: "/finalize" });
  }, [fetcher.data]);

  const handleGetBalance = useCallback((balanceCbor: CborHex<Value>) => {
    const formData = new FormData();
    formData.append("balanceCbor", balanceCbor);
    dataFetcher.submit(formData, { method: "post", action: "/balance" });
  }, [])

  const handleWaitForTransaction = useCallback((addressHex: string, txId: string) => {
    setIsWaitingConfirmation(true);
    const formData = new FormData();
    formData.append("addressHex", addressHex);
    formData.append("txId", txId);
    waitFetcher.submit(formData, { method: "post", action: "/wait" });
  }, [])

  useEffect(() => {
    const savedWalletId = localStorage.getItem('selectedWalletId');
    const wallet = wallets.find((w) => w.id === savedWalletId);
    if (wallet) {
      handleSelectWallet(wallet);
    }
  }, [wallets]);

  useEffect(() => {
    const process = async () => {
      const balance = await walletApi?.getBalance();
      if (balance !== undefined) {
        handleGetBalance(balance);
      }
    }
    if (selectedWallet === null || walletApi === undefined) {
      setTunaBalance({
        tuna_v1: 0,
        tuna_v2: 0
      });
    } else if (walletApi != undefined) {
      process();
    }
  }, [walletApi, isWaitingConfirmation, selectedWallet]);

  useEffect(() => {
    setWallets(getWallets());
  }, []);

  useEffect(() => {
    if (waitFetcher.data !== undefined && waitFetcher.data !== null) {
      setIsWaitingConfirmation(false);
    }
  }, [waitFetcher.data])

  useEffect(() => {
    const process = async () => {
      if (fetcher.data?.type === "convert") {
        try {
          const txWitnessCbor = await walletApi?.signTx(fetcher.data?.tx_cbor as CborHex<Transaction>, true);
          if (txWitnessCbor !== undefined && txWitnessCbor !== null) {
            handleFinalize(fetcher.data.tx_cbor, txWitnessCbor?.toString()!);
          }
        } catch (error) {
          setIsloading(false);
        }
      } else if (fetcher.data?.type === "finalize") {
        const txHash = await walletApi?.submitTx(fetcher.data?.tx_cbor as CborHex<Transaction>);
        if (txHash !== undefined) {
          setIsSuccess(true);
          setIsWaitingConfirmation(true);
          handleWaitForTransaction(addressHex!, txHash);
          setIsloading(false);
        }
      }
    };

    if (fetcher.data !== undefined && fetcher.data !== null) {
      setIsloading(true);
      if (fetcher.data?.success) {
        process();
      } else {
        setIsloading(false);
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (dataFetcher.data !== undefined && dataFetcher.data !== null) {
      const decimals = 8;
      const factor = Math.pow(10, decimals);
      const result = dataFetcher.data as TunaBalance;
      const tunaV1 = Number((Number(result.tuna_v1) / factor).toFixed(2));
      const tunaV2 = Number((Number(result.tuna_v2) / factor).toFixed(2));
      setTunaBalance({
        tuna_v1: tunaV1,
        tuna_v2: tunaV2
      });
    }

  }, [dataFetcher.data])

  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center gap-2">
      {isModalOpen && <SelectWalletModal
        wallets={wallets} handleSelectWallet={handleSelectWallet}
        selectedWallet={selectedWallet} onClose={() => setIsModalOpen(false)} />
      }
      {isSuccess && !isWaitingConfirmation && <Confetti />}
      {isSuccess && <SuccesModal onClose={() => setIsSuccess(false)} isLoading={isWaitingConfirmation} />}
      <div className="flex gap-4 flex-col w-[800px] h-[400px] bg-[#15191e] drop-shadow-xl rounded-lg p-5">
        <div className="flex justify-between items-center">
          <div className="w-[200px]">
            <img src="/logo.png" alt="Fortuna Logo" className="w-full h-full" />
          </div>
          {selectedWallet ? (
            <div
              className="flex items-center justify-center w-[50px] h-[50px] border border-[#00cdb8] rounded-full cursor-pointer
              hover:bg-[#00cdb8]/10 active:bg-[#00cdb8]/20 transition select-none"
              onClick={handleOpenModal}
            >
              <div className="w-[24px] h-[24px]">
                <img
                  src={selectedWallet.icon}
                  alt="Selected Wallet Icon"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center w-[50px] h-[50px] border border-[#00cdb8] rounded-full cursor-pointer
              hover:bg-[#00cdb8]/10 active:bg-[#00cdb8]/20 transition select-none"
              onClick={handleOpenModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#00cdb8"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.75 5.75A2.25 2.25 0 015 3.5h14a2.25 2.25 0 012.25 2.25v1.25M2.75 5.75h18.5M2.75 5.75A2.25 2.25 0 000 8v9.5A2.25 2.25 0 002.25 19.75h16.5A2.25 2.25 0 0021 17.5V12H5a2.25 2.25 0 01-2.25-2.25V8a2.25 2.25 0 00-2.25-2.25zM21 12v-1.5A1.5 1.5 0 0019.5 9h-2a.75.75 0 000 1.5h2a.75.75 0 01.75.75V12z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="w-full flex justify-center items-center">
          <h1 className="text-[22px]">Convert Your V1 $TUNA</h1>
        </div>

        <div className="grid grid-cols-3 items-center w-full">
          <div className="flex flex-col">
            <div className="text-[#ff5861]">$TUNA V1</div>
            <div className="text-[46px] font-semibold">{tunaBalance ? tunaBalance.tuna_v1 : "0"}</div>
          </div>

          <div className="flex justify-center items-center">
            <button className="w-12 h-12 p-2 border border-[#00cdb8] rounded-full flex items-center justify-center text-[#00cdb8] hover:bg-[#00cdb8] hover:text-white transition">
              <FishIcon />
            </button>
          </div>

          <div className="flex flex-col text-right">
            <div className="text-[#00a96e]">V2 $TUNA</div>
            <div className="text-[46px] font-semibold">{tunaBalance ? tunaBalance.tuna_v2 : "0"}</div>
          </div>
        </div>


        <div className="w-full">
          <div className="flex items-center w-full p-2 border rounded-md bg-[#1E2329] border-[#16191E]">
            <img
              src="fortuna_icon.png"
              alt="Fortuna Icon"
              className="h-6 w-6 mr-2"
            />
            <input
              type="text"
              className="flex-grow bg-transparent text-[#D1D5DB] placeholder-[#6B7280] outline-none"
              placeholder="0"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-grow w-full flex flex-col items-center justify-center space-y-2">
          <div
            className="flex items-center justify-center w-[200px] p-2 bg-[#5A66F6] rounded-md cursor-pointer 
               hover:bg-[#4E5BE5] active:bg-[#3F4CCB] transition select-none"
            onClick={!isLoading ? handleConvert : undefined}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black mr-2"></div>
                <span className="text-black font-medium">Converting...</span>
              </>
            ) : (
              <>
                <ConvertIcon />
                <span className="text-black font-medium">CONVERT</span>
              </>
            )}
          </div>

          <div className="w-full flex justify-center">
            <span className="text-sm text-[#ff5861]">{statusMessage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}