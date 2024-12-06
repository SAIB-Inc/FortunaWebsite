import { CardanoWallet } from "@saibdev/bifrost";
import React from "react";

interface SelectWalletModalProps {
    wallets: CardanoWallet[];
    handleSelectWallet: (wallet: CardanoWallet | null) => void;
    selectedWallet: CardanoWallet | null;
    onClose?: () => void;
}

const capitalize = (str: string) => {
    if (str.length === 0) return str; // handle empty string case
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const SelectWalletModal: React.FC<SelectWalletModalProps> = ({
    wallets,
    handleSelectWallet,
    selectedWallet,
    onClose,
}) => {

    const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // Prevent clicking inside the modal from closing it
    };

    return (
        <div
            className="fixed inset-0 backdrop-blur-sm bg-black/30 z-10 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="flex flex-col w-[600px] bg-[#15191e] rounded-lg p-6 text-white"
                onClick={handleModalClick}
            >
                {/* Heading */}
                <h2 className="text-2xl font-semibold mb-3 text-center">Choose your wallet!</h2>

                {/* Subheading / Disclaimer */}
                <p className="text-base text-gray-400 mb-5">
                    By connecting your wallet, you acknowledge and accept full responsibility 
                    for any potential risks or losses involved.
                </p>

                {/* Wallet List */}
                <div className="flex flex-col gap-2">
                    {wallets.map((wallet) => (
                        <div
                            key={wallet.name}
                            className="flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-[#2a2f36] transition-colors"
                            onClick={() => handleSelectWallet(wallet)}
                        >
                            <div className="w-[30px] h-[30px]">
                                <img
                                    src={wallet.icon}
                                    alt={`${wallet.name} Logo`}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-white font-medium text-lg">{capitalize(wallet.name)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export { SelectWalletModal };