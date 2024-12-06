import { json, type ActionFunction, type MetaFunction } from "@remix-run/node";
import { ConvertIcon } from "~/components/convert_icon";
import { FishIcon } from "~/components/fish_icon";
import { AddressHex, CardanoWallet, CardanoWalletApi, getWallets } from "@saibdev/bifrost";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SelectWalletModal } from "~/components/select_wallet_modal";
import { buildConvertTunaTx } from "~/tunaTx";
import { useFetcher } from "@remix-run/react";

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
  const fetcher = useFetcher();

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
    }
  }, []);

  const handleConvert = useCallback(() => {
    const decimals = 8; // the number of decimals your token has
    const factor = Math.pow(10, decimals);

    if (!addressHex || !amountInput) return;

    const amountFloat = parseFloat(amountInput);
    if (isNaN(amountFloat)) return;

    const amountInteger = Math.round(amountFloat * factor);

    const formData = new FormData();
    formData.append("amount", amountInteger.toString());
    formData.append("addressHex", addressHex);

    fetcher.submit(formData, { method: "post", action: "/convert" });

  }, [addressHex, amountInput]);

  useEffect(() => {
    const savedWalletId = localStorage.getItem('selectedWalletId');
    const wallet = wallets.find((w) => w.id === savedWalletId);
    if (wallet) {
      handleSelectWallet(wallet);
    }
  }, [wallets]);

  useEffect(() => {
    setWallets(getWallets());
  }, []);

  useEffect(() => {
    console.log(fetcher.data);
  }, [fetcher.data]);

  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center gap-2">
      {isModalOpen && <SelectWalletModal
        wallets={wallets} handleSelectWallet={handleSelectWallet}
        selectedWallet={selectedWallet} onClose={() => setIsModalOpen(false)} />
      }
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

        <div className="flex w-full">
          <div className="flex flex-grow flex-col">
            <div className="text-[#ff5861]">$TUNA V1</div>
            <div className="text-[46px] font-semibold">0</div>
          </div>
          <div className="flex flex-col justify-center items-center text-[30px]">
            <button className="w-12 h-12 p-2 border border-[#00cdb8] rounded-full flex items-center justify-center text-[#00cdb8] hover:bg-[#00cdb8] hover:text-white transition">
              <FishIcon />
            </button>
          </div>
          <div className="flex flex-grow flex-col text-right">
            <div className="text-[#00a96e]">V2 $TUNA</div>
            <div className="text-[46px] font-semibold">0</div>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-center w-full p-2 border rounded-md bg-[#1E2329] border-[#16191E]">
            {/* Currency Icon */}
            <img
              src="fortuna_icon.png"
              alt="Fortuna Icon"
              className="h-6 w-6 mr-2"
            />

            {/* Input Field */}
            <input
              type="text"
              className="flex-grow bg-transparent text-[#D1D5DB] placeholder-[#6B7280] outline-none"
              placeholder="0"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-grow w-full flex items-center justify-center">
          <div className="flex items-center justify-center w-[200px] p-2 bg-[#5A66F6] rounded-md cursor-pointer 
                  hover:bg-[#4E5BE5] active:bg-[#3F4CCB] transition select-none" onClick={handleConvert}>
            <ConvertIcon />
            <span className="text-black font-medium">CONVERT</span>
          </div>
        </div>


      </div>
    </div>
  );
}