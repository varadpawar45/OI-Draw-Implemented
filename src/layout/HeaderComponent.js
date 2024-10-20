import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

function HeaderComponent({ isMapPage }) {
  return (
    <header
      className={`absolute top-0 left-0 w-full h-[10%] ${
        isMapPage ? "bg-opacity-0" : "bg-white"
      } transition-opacity duration-500 z-9 flex items-center justify-center`}
    >
      <FontAwesomeIcon icon={faBars} className="text-3xl" />
    </header>
  );
}

export default HeaderComponent;
