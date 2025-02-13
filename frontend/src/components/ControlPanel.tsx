import { CSSProperties } from "react";
import { ControlPanelProps } from "../types";
import ConnectionButton from "./ConnectionButton";
import RecordButton from "./RecordButton";

export default function ControlPanel({
    isConnected,
    isRecording,
    onStartRecording,
    onStopRecording,
    onToggleConnection,
}: ControlPanelProps) {
    const panelStyle: CSSProperties = {
        position: "absolute",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "1rem",
    };

    return (
        <div style={panelStyle}>
            {
                isConnected && <RecordButton
                    isRecording={isRecording}
                    onMouseDown={onStartRecording}
                    onMouseUp={onStopRecording}
                    disabled={!isConnected}
                />
            }

            <ConnectionButton
                isConnected={isConnected}
                onClick={onToggleConnection}
            />
        </div>
    );
}