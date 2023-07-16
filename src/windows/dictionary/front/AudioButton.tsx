import { Button } from '@geist-ui/core';
import { useAtomValue } from 'jotai';
import { infinitiveAtom, infinitiveKanaAtom } from './Dictionary';
import { useEffect, useRef, useState } from 'react';
import log_renderer from 'electron-log/renderer';
import { getWindowStore } from '@globals/ts/main/initializeStore';
const log = log_renderer.scope('dictionary/AudioButton');

const windowStore = getWindowStore();

const BUTTON_MESSAGES = {
    'PLAY': 'Play audio',
    'NOT_AVAILABLE': 'Audio not available',
    'ERROR': 'Audio Error',
    'LOADING': 'Loading...'
};

const getURL = (infinitive: string, infinitiveKana: string) => {
    return `https://assets.languagepod101.com/dictionary/japanese/audiomp3.php?kanji=${infinitive}&kana=${infinitiveKana}`;
};

export const AudioButton = () => {
    const infinitive = useAtomValue(infinitiveAtom);
    const infinitiveKana = useAtomValue(infinitiveKanaAtom);
    const canPlayAudio = useRef(false);
    const [source, setSource] = useState(getURL(infinitive, infinitiveKana));
    const audioRef = useRef<HTMLAudioElement>();
    const [disabled, setDisabled] = useState(false);
    const [buttonText, setButtonText] = useState(BUTTON_MESSAGES.LOADING);
    const [volume, setVolume] = useState(windowStore.get('dictionary.additional.audioVolume', 15));

    const setLoading = (state: boolean, buttonText = '') => {
        setDisabled(state);
        setButtonText(state ? BUTTON_MESSAGES.LOADING : buttonText);
    };

    useEffect(() => {
        canPlayAudio.current = false;
        setLoading(true);
        setSource(getURL(infinitive, infinitiveKana));
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [infinitive, source]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 20;
        }
    }, [volume]);

    const playSnippet = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.play();
        }
    };

    const onLoadedMetadata = () => {
        if (audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration !== 5.694694) {
            setLoading(false, BUTTON_MESSAGES.PLAY);
        } else {
            setButtonText(BUTTON_MESSAGES.NOT_AVAILABLE);
        }
    };

    const onVolumeChange = (event: any) => {
        setVolume(event.target.value);
        windowStore.set('dictionary.additional.audioVolume', event.target.value);
    };

    return <>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input type="range" min={0} max={20} value={volume} onChange={onVolumeChange} />
            <Button 
                disabled={disabled}
                loading={buttonText == BUTTON_MESSAGES.LOADING}
                onClick={playSnippet}>
                {buttonText}
            </Button>
        </div>
        <audio style={{ display: 'none' }} ref={audioRef} preload="metadata" onLoadedMetadata={onLoadedMetadata}>
            <source src={source} type='audio/mpeg' />
        </audio>
    </>;
};