import { useAuthStore } from "../../store/useAuthStore";

const Logout = () => {
  const { logout } = useAuthStore();

  return (
    <div className="w-full">
      <button
        className="w-full h-[52px] duration-150 transition-all cursor-pointer rounded-sm bg-spec-1 text-label-text hover:bg-red-800 hover:text-red-200 font-semibold"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

export default Logout;
