import { CardanoWallet } from "@saibdev/bifrost"

interface SelectWalletModalProps {
    wallets: CardanoWallet[];
    handleSelectWallet: (wallet: CardanoWallet | null) => void;
    selectedWallet: CardanoWallet | null;
}

const capitalize = (str: string) => {
    if (str.length === 0) return str; // handle empty string case
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const SelectWalletModal = ({ wallets, handleSelectWallet, selectedWallet }: SelectWalletModalProps) => {
    return (
        <div className="flex gap-4 flex-col w-[300px] h-[400px] bg-[#15191e] drop-shadow-xl rounded-lg p-5">
            {wallets.map((wallet: CardanoWallet) => (
                <div className="flex items-center gap-2 justify-center w-full p-2 bg-[#5A66F6] rounded-md cursor-pointer 
                  hover:bg-[#4E5BE5] active:bg-[#3F4CCB] transition select-none" onClick={() => handleSelectWallet(wallet)}>
                    <div className="w-[30px]">
                        <img src={wallet.icon} alt="Fortuna Logo" className="w-full h-full" />
                    </div>
                    <span className="text-black font-medium">{capitalize(wallet.name)}</span>
                </div>
            ))}
            {selectedWallet && 
            <div className="flex items-center gap-2 justify-center w-full p-2 bg-[#ff5861] rounded-md cursor-pointer 
                  hover:bg-[#FF969C] active:bg-[#ff5861] transition select-none" onClick={() => handleSelectWallet(null)}>
                    <span className="text-black font-medium">Sign Out</span>
                </div>
            }
        </div>
    )
}

export {SelectWalletModal};