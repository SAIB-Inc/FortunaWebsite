interface SuccesModalProps {
    onClose: () => void;
    isLoading: boolean;
}

const SuccesModal = ({ onClose, isLoading }: SuccesModalProps) => {
    return (
        <div
            className="fixed inset-0 backdrop-blur-sm bg-black/30 z-10 flex items-center justify-center"
            onClick={!isLoading ? onClose : undefined}
        >
            <div
                className="flex flex-col items-center w-[500px] bg-[#15191e] rounded-lg p-8 text-white"
            >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#00cdb8]/10 mb-6">
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent border-[#00cdb8]"></div>
                    ) : (
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
                    )}
                </div>

                <h2 className="text-white font-bold text-2xl mb-3">{isLoading ? "Hang Tight" : "Success!"}</h2>
                <p className="text-[#D1D5DB] text-md mb-1">
                    {isLoading ? "We're finalizing your transaction. Just a moment..." : "Your transaction has been processed successfully!"}
                </p>
            </div>
        </div>
    );
};

export { SuccesModal };