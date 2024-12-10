import { i } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

interface SuccesModalProps {
    onClose: () => void;
    isLoading: boolean;
    txId: string;
}

const SuccesModal = ({ onClose, isLoading, txId }: SuccesModalProps) => {
    return (
        <div
            className="fixed inset-0 backdrop-blur-sm bg-black/30 z-10 flex items-center justify-center"
        >
            <div
                className="flex flex-col items-center w-[500px] bg-[#15191e] rounded-lg p-8 text-white"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center w-16 h-16 rounded-full /10 mb-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent border-[#00cdb8]"></div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#00cdb8]/10 mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-[#00cdb8]"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                )}

                <h2 className="text-white font-bold text-2xl mb-3">{isLoading ? "Hang Tight" : "Success!"}</h2>
                <p className="text-[#D1D5DB] text-md mb-1">
                    {isLoading
                        ? "We're waiting for confirmation on your transaction. Hang tight..."
                        : "Your transaction has been successfully confirmed!"}
                </p>
                <a
                    href={`https://cardanoscan.io/transaction/${txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00cdb8] hover:underline text-md"
                >
                    View your transaction details here
                </a>
                {!isLoading ?
                    <div className="flex items-center justify-center pt-3 w-[150px]">
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center w-[200px] p-2 bg-[#5A66F6] rounded-md cursor-pointer hover:bg-[#4E5BE5] active:bg-[#3F4CCB] transition select-none"
                        >
                            Close
                        </button>
                    </div>
                    : <></>}
            </div>
        </div>
    );
};

export { SuccesModal };