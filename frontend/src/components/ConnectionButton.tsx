import { CSSProperties } from "react";
import { ConnectionButtonProps } from "../types";
import { FiPower, FiWifi } from "react-icons/fi";

export default function ConnectionButton({ isConnected, onClick }: ConnectionButtonProps) {
    const buttonStyle: CSSProperties = {
        padding: "0.8rem 1.2rem",
        fontSize: "1rem",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        border: "none",
        borderRadius: "5px",
        backgroundColor: isConnected ? "#f44336" : "#2196F3",
        color: "white",
    };

    return (
        <button style={buttonStyle} onClick={onClick}>
            {isConnected ? <FiPower /> : <FiWifi />}
            {isConnected ? "Disconnect" : "Connect"}
        </button>
    );
}