import {
    useState,
    useEffect,
    useRef,
    useCallback,
    CSSProperties,
} from "react";
import { WavRecorder, WavStreamPlayer } from "../lib/wavtools/index.js";
import { RealtimeClient } from "@openai/realtime-api-beta";
import { instructions } from "../utils/conversation_config";
import ControlPanel from "./ControlPanel";
import ChatMessages from "./ChatMessages";

const LOCAL_SOCKET_SERVER_URL: string =
    process.env.REACT_APP_LOCAL_SOCKET_SERVER_URL || "";

const DEFAULT_COLOR = "#000000";

// Type guard for conversation items that have content.
function isContentItem(
    item: any
): item is Extract<any, { content: { transcript: string }[] }> {
    return "content" in item;
}

export default function BackgroundChange() {
    // Refs for recorder, stream player and realtime client.
    const wavRecorderRef = useRef<WavRecorder>(
        new WavRecorder({ sampleRate: 24000 })
    );
    const wavStreamPlayerRef = useRef<WavStreamPlayer>(
        new WavStreamPlayer({ sampleRate: 24000 })
    );
    const clientRef = useRef<RealtimeClient>(
        new RealtimeClient({ url: LOCAL_SOCKET_SERVER_URL })
    );

    // State hooks.
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [items, setItems] = useState<any[]>([]);
    const [colorCode, setColorCode] = useState<string>(DEFAULT_COLOR);

    // Connect conversation and start streaming.
    const connectConversation = useCallback(async () => {
        const client = clientRef.current;
        const wavRecorder = wavRecorderRef.current;
        const wavStreamPlayer = wavStreamPlayerRef.current;

        try {
            setIsConnected(true);
            setItems(client.conversation.getItems());

            await wavRecorder.begin();
            await wavStreamPlayer.connect();

            await client.connect();
            client.sendUserMessageContent([
                {
                    type: "input_text",
                    text: "Hello!",
                },
            ]);

            if(client.getTurnDetectionType() === "server_vad") {
                await wavRecorder.record((data) =>
                    client.appendInputAudio(data.mono)
                );
            }
        } catch(error) {
            console.error("Error connecting conversation:", error);
        }
    }, []);

    // Disconnect conversation and stop streaming.
    const disconnectConversation = useCallback(async () => {
        const client = clientRef.current;
        const wavRecorder = wavRecorderRef.current;
        const wavStreamPlayer = wavStreamPlayerRef.current;

        try {
            setIsConnected(false);
            setItems([]);

            client.disconnect();
            await wavRecorder.end();
            await wavStreamPlayer.interrupt();
        } catch(error) {
            console.error("Error disconnecting conversation:", error);
        }
    }, []);

    // Start recording audio.
    const startRecording = async () => {
        const client = clientRef.current;
        const wavRecorder = wavRecorderRef.current;
        const wavStreamPlayer = wavStreamPlayerRef.current;

        try {
            setIsRecording(true);
            const trackSampleOffset = await wavStreamPlayer.interrupt();
            if(trackSampleOffset?.trackId) {
                const { trackId, offset } = trackSampleOffset;
                await client.cancelResponse(trackId, offset);
            }
            await wavRecorder.record((data) => client.appendInputAudio(data.mono));
        } catch(error) {
            console.error("Error starting recording:", error);
        }
    };

    // Stop recording and trigger response.
    const stopRecording = async () => {
        const client = clientRef.current;
        const wavRecorder = wavRecorderRef.current;

        try {
            setIsRecording(false);
            await wavRecorder.pause();
            client.createResponse();
        } catch(error) {
            console.error("Error stopping recording:", error);
        }
    };

    // Set up realtime client session and event listeners.
    useEffect(() => {
        const client = clientRef.current;
        const wavStreamPlayer = wavStreamPlayerRef.current;

        client.updateSession({ instructions });
        client.updateSession({
            input_audio_transcription: { model: "whisper-1" },
        });

        const handleError = (event: any) => console.error(event);
        const handleInterrupted = async () => {
            try {
                const trackSampleOffset = await wavStreamPlayer.interrupt();
                if(trackSampleOffset?.trackId) {
                    const { trackId, offset } = trackSampleOffset;
                    await client.cancelResponse(trackId, offset);
                }
            } catch(error) {
                console.error("Error handling interruption:", error);
            }
        };

        const handleConversationUpdated = async ({ item, delta }: any) => {
            try {
                const updatedItems = client.conversation.getItems();
                if(delta?.audio) {
                    wavStreamPlayer.add16BitPCM(delta.audio, item.id);
                }
                if(item.status === "completed" && item.formatted.audio?.length) {
                    const wavFile = await WavRecorder.decode(
                        item.formatted.audio,
                        24000,
                        24000
                    );
                    item.formatted.file = wavFile;
                }
                setItems(updatedItems);
            } catch(error) {
                console.error("Error updating conversation:", error);
            }
        };

        client.on("error", handleError);
        client.on("conversation.interrupted", handleInterrupted);
        client.on("conversation.updated", handleConversationUpdated);

        setItems(client.conversation.getItems());

        return () => {
            client.reset();
        };
    }, []);

    // Update background color when new conversation items are received.
    useEffect(() => {
        if(items.length === 0) return;

        const finalResponse = items[items.length - 1];
        let transcript = "";
        if(isContentItem(finalResponse)) {
            transcript = finalResponse.content[0]?.transcript || "";
        }
        const extractedColor = transcript.match(/#([0-9A-Fa-f]{6})/)?.[0];
        setColorCode(extractedColor || DEFAULT_COLOR);
    }, [items]);

    // Container style that uses the color code as the background.
    const containerStyle: CSSProperties = {
        background: colorCode,
        height: "100vh",
        position: "relative",
        overflow: "hidden",
    };

    return (
        <div style={containerStyle}>
            <ChatMessages messages={items} />
            <ControlPanel
                isConnected={isConnected}
                isRecording={isRecording}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                onToggleConnection={isConnected ? disconnectConversation : connectConversation}
            />
        </div>
    );
}
