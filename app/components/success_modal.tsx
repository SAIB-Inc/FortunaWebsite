import { i } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

interface SuccesModalProps {
    onClose: () => void;
    isLoading: boolean;
    txId: string;
    explorerUrl: string | undefined;
}

const SuccessModal = ({ onClose, isLoading, txId, explorerUrl }: SuccesModalProps) => {
    return (
        <div
            className="fixed inset-0 backdrop-blur-sm bg-black/30 z-10 flex items-center justify-center"
            role="dialog"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <div className="flex flex-col items-center w-[500px] bg-[#15191e] rounded-lg p-6 text-white shadow-lg">
                {/* Header */}
                <div className="flex flex-col items-center mb-6">
                    <h2
                        id="modal-title"
                        className="text-white font-bold text-3xl mb-2"
                    >
                        {isLoading ? "Hang Tight" : "Success"}
                    </h2>
                    <p
                        id="modal-description"
                        className="text-[#D1D5DB] text-center text-lg leading-relaxed"
                    >
                        {isLoading
                            ? "We're waiting for confirmation on your transaction. Hang tight..."
                            : "Your transaction has been successfully confirmed!"}
                    </p>
                </div>

                {/* Transaction Link */}
                <a
                    href={`${explorerUrl}/${txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00cdb8] hover:underline text-md mb-6"
                >
                    View your transaction details here
                </a>

                {/* Spinner or Button */}
                <div className="flex items-center justify-center w-full">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-[#00cdb8]"></div>
                            <p className="text-[#D1D5DB] text-sm">Processing...</p>
                        </div>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-[200px] p-3 bg-[#5A66F6] rounded-md cursor-pointer hover:bg-[#4E5BE5] active:bg-[#3F4CCB] transition select-none text-lg font-medium"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export { SuccessModal };