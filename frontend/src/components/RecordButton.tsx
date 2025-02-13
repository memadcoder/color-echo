import { CSSProperties } from "react";
import { RecordButtonProps } from "../types";
import { FaMicrophone, FaStop } from "react-icons/fa";

export default function RecordButton({
    isRecording,
    onMouseDown,
    onMouseUp,
    disabled,
}: RecordButtonProps) {
    const buttonStyle: CSSProperties = {
        padding: "0.8rem 1.2rem",
        fontSize: "1rem",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        border: "none",
        borderRadius: "5px",
        backgroundColor: "#4CAF50",
        color: "white",
    };

    return (
        <button
            style={buttonStyle}
            disabled={disabled}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
        >
            {isRecording ? <FaStop /> : <FaMicrophone />}
            {isRecording ? "Stop Listening" : "Start Listening"}
        </button>
    );
}