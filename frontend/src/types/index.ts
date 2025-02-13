export interface RecordButtonProps {
    isRecording: boolean;
    onMouseDown: () => void;
    onMouseUp: () => void;
    disabled: boolean;
}

export interface ControlPanelProps {
    isConnected: boolean;
    isRecording: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onToggleConnection: () => void;
}

export interface RecordButtonProps {
    isRecording: boolean;
    onMouseDown: () => void;
    onMouseUp: () => void;
    disabled: boolean;
}

export interface ConnectionButtonProps {
    isConnected: boolean;
    onClick: () => void;
}