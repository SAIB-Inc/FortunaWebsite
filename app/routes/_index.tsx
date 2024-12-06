import type { MetaFunction } from "@remix-run/node";
import { ConvertIcon } from "~/components/convert_icon";
import { FishIcon } from "~/components/fish_icon";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center">
      <div className="flex gap-4 flex-col w-[800px] h-[400px] bg-[#15191e] drop-shadow-xl rounded-lg p-5">

        <div className="flex justify-center items-center">
          <div className="w-[200px]">
            <img src="/logo.png" alt="Fortuna Logo" className="w-full h-full" />
          </div>
        </div>

        <div className="w-full">
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
            <input
              type="text"
              className="flex-grow bg-transparent text-[#D1D5DB] placeholder-[#6B7280] outline-none"
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex-grow w-full flex items-center justify-center">
          <div className="flex items-center justify-center w-[200px] p-2 bg-[#5A66F6] rounded-md cursor-pointer 
                  hover:bg-[#4E5BE5] active:bg-[#3F4CCB] transition select-none">
            <ConvertIcon />
            <span className="text-black font-medium">CONVERT</span>
          </div>
        </div>


      </div>
    </div>
  );
}