/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin, { Region } from 'wavesurfer.js/dist/plugins/regions.js';

import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js';
import Minimap from 'wavesurfer.js/dist/plugins/minimap.js';

interface WaveformProps {
  url: string;
  onSelection: (start: number, end: number) => void;
  edit: boolean;
}

const Waveform: React.FC<WaveformProps> = ({ url, onSelection, edit }) => {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const editRef = useRef(edit);
  const wsRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    editRef.current = edit;
    if (wsRef.current) {
      wsRef.current.setOptions({ autoCenter: !edit });
    }
  }, [edit]);

  const createWaveSurfer = (url: string) => {
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      url: url,
      waveColor: '#0080ff',
      progressColor: '#004080',
      cursorColor: '#ffffff',
      cursorWidth: 2,
      barWidth: 1,
      barGap: 1,
      barRadius: 1,
      barHeight: 0.7,
      minPxPerSec: 2, //El ancho del audio
      autoCenter: true,
      autoScroll: true,
      mediaControls: true,
    } as any);
    wavesurfer.registerPlugin(
      TimelinePlugin.create({
        height: 24,
        insertPosition: 'beforebegin',
        timeInterval: 5,
        primaryLabelInterval: 60,
        secondaryLabelInterval: 30,
        style: {
          fontSize: '18px',
          color: '#2D5B88',
        },
      })
    );

    wavesurfer.registerPlugin(
      Minimap.create({
        container: waveformRef.current,
        height: 20,
        barHeight: 0.5,
        waveColor: '#ddd',
        progressColor: '#999',
        // the Minimap takes all the same options as the wavesurferRef.current itself
        plugins: [
          TimelinePlugin.create({
            height: 10,
            timeInterval: 5,
            primaryLabelInterval: 60,
            secondaryLabelInterval: 30,
            style: {
              fontSize: '8px',
              color: '#2D5B88',
            },
            formatTimeCallback: function (secs) {
              const minutes = Math.floor(secs / 60) || 0;
              const seconds = secs - minutes * 60 || 0;
              return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            },
          }),
        ],
      } as any)
    );
    return wavesurfer;
  };

  const setStratEnd = useCallback(
    (region: Region) => {
      if (!wsRef.current) return null;
      const pos = wsRef.current.getCurrentTime();
      const medio = (region.start + region.end) / 2;
      if (region.start === 0) {
        region.setOptions({ start: pos, end: pos + 30 });
      } else if (pos <= medio) {
        region.setOptions({ start: pos });
      } else {
        region.setOptions({ start: region.start, end: pos });
      }
      onSelection(region.start, region.end);
    },
    [onSelection]
  );

  useEffect(() => {
    if (!waveformRef.current) return;

    wsRef.current = createWaveSurfer(url);

    const wsRegions = wsRef.current.registerPlugin(RegionsPlugin.create());
    wsRef.current.on('decode', () => {
      wsRegions.addRegion({
        start: 0,
        end: 1,
        color: 'rgba(180, 180, 180, 0.5)',
        drag: false,
        resize: true,
      });
    });
    let touchtime = 0;
    wsRef.current.on('click', () => {
      if (!wsRef.current) return;
      if (touchtime === 0) {
        // set first click
        wsRef.current.play();
        touchtime = new Date().getTime();
      } else if (new Date().getTime() - touchtime < 800 && editRef.current) {
        // compare first click to this click and see if they occurred within double click threshold

        // double click occurred

        const region = wsRegions.getRegions()[0];
        setStratEnd(region);

        touchtime = 0;
      } else {
        // not a double click so set as a new first click
        touchtime = new Date().getTime();
      }
    });
    wsRegions.on('region-clicked', (region, e) => {
      if (!editRef.current) {
        e.stopPropagation(); // prevent triggering a click on the waveform
        region.play();
      }
    });

    return () => {
      if (!wsRef.current) return;
      return wsRef.current.destroy();
    };
  }, [url, setStratEnd]);

  return <div ref={waveformRef} />;
};

export default Waveform;
