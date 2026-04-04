// src/hooks/useClickOutside.js
import { useEffect } from "react";

const useClickOutside = (ref, handler, when = true) => {
  useEffect(() => {
    if (!when) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler, when]);
};

export default useClickOutside;
