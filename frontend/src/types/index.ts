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

export interface ContentItem {
    type: string;
    transcript: string;
}

export interface Message {
    id: string;
    object: string;
    type: string;
    status: string;
    role: string;
    content: ContentItem[];
}

export interface ChatMessagesProps {
    messages: Message[];
}