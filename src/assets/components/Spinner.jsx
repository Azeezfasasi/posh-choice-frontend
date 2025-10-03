import { MoonLoader } from "react-spinners";

const Spinner = () => (
  <div className="flex flex-col justify-center items-center min-h-[40vh] w-full">
    <MoonLoader color="#082f72" size={70} speedMultiplier={1} />
    <p className="font-semibold">Loading</p>
  </div>
);

export default Spinner;